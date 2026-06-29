import { prisma } from "../database/prisma.js";
import type {
  KpiFilters,
  KpiResult,
  RevenueTrendFilters,
  RevenueTrendItem,
  SalesRepository,
  ProductRankingFilters,
  ProductRankingItem,
} from "../../domain/repositories/sales.repository.js";

// Adaptador de infraestructura: traduce el contrato del dominio a consultas SQL
// contra el esquema estrella gold. La capa de aplicacion solo conoce la
// interfaz SalesRepository; Prisma y PostgreSQL quedan encapsulados aqui.
export class PrismaSalesRepository implements SalesRepository {
  // Los tres endpoints comparten filtros. Esta funcion construye el WHERE y
  // mantiene los valores separados del SQL para que Prisma los envie como
  // parametros posicionales ($1, $2, ...).
  private buildFilterConditions(filters: KpiFilters): {
    conditions: string[];
    params: unknown[];
  } {
    // El rango de fechas siempre es obligatorio y filtra por la dimension fecha.
    const conditions: string[] = [`d.date BETWEEN $1::date AND $2::date`];
    const params: unknown[] = [filters.from, filters.to];

    // Cada filtro opcional agrega una condicion y reutiliza la posicion real
    // dentro de params. Asi no hay que calcular manualmente $3, $4, etc.
    if (filters.status) {
      params.push(filters.status);
      conditions.push(`o.status = $${params.length}`);
    }

    if (filters.state) {
      params.push(filters.state);
      conditions.push(`c.state = $${params.length}`);
    }

    if (filters.category) {
      params.push(filters.category);
      conditions.push(`p.product_category_name_english = $${params.length}`);
    }

    return { conditions, params };
  }

  async getKpis(filters: KpiFilters): Promise<KpiResult> {
    const { conditions, params } = this.buildFilterConditions(filters);

    // Consulta agregada principal del dashboard. Se parte de fact_sales porque
    // ahi viven las medidas numericas, y se unen dimensiones solo para filtrar.
    const query = `
      SELECT
        -- GMV: valor bruto de productos vendidos, sin incluir flete.
        COALESCE(SUM(f.item_price), 0)::float AS gmv,
        -- Shipping: costo total de envio cobrado en los items.
        COALESCE(SUM(f.freight_value), 0)::float AS shipping,
        -- Revenue: pagos asignados a cada item durante el ETL.
        COALESCE(SUM(f.payment_value_allocated), 0)::float AS revenue,
        COUNT(DISTINCT f.order_id)::int AS orders,
        COUNT(f.order_item_id)::int AS items,

        -- AOV: ticket promedio por orden. NULLIF evita dividir entre cero.
        COALESCE(
          COALESCE(SUM(f.payment_value_allocated), 0)
          / NULLIF(COUNT(DISTINCT f.order_id), 0),
          0
        )::float AS aov,

        COALESCE(
          COUNT(f.order_item_id)::numeric
          / NULLIF(COUNT(DISTINCT f.order_id), 0),
          0
        )::float AS "itemsPerOrder",

        -- Tasa de cancelacion sobre ordenes distintas del periodo filtrado.
        COALESCE(
          SUM(CASE WHEN f.is_canceled THEN 1 ELSE 0 END)::numeric
          / NULLIF(COUNT(DISTINCT f.order_id), 0),
          0
        )::float AS "cancellationRate",

        -- Entregas a tiempo sobre el universo de ordenes entregadas.
        COALESCE(
          SUM(CASE WHEN f.is_on_time THEN 1 ELSE 0 END)::numeric
          / NULLIF(SUM(CASE WHEN f.is_delivered THEN 1 ELSE 0 END), 0),
          0
        )::float AS "onTimeDeliveryRate"

      FROM gold.fact_sales f
      JOIN gold.dim_date d ON d.date_id = f.date_id
      JOIN gold.dim_order o ON o.order_id = f.order_id
      JOIN gold.dim_customer c ON c.customer_id = f.customer_id
      LEFT JOIN gold.dim_product p ON p.product_id = f.product_id
      WHERE ${conditions.join(" AND ")};
    `;

    // Se usa queryRawUnsafe porque la consulta arma fragmentos SQL controlados
    // por el backend (WHERE, DATE_TRUNC y ORDER BY). Los valores del usuario
    // siguen entrando por parametros, no concatenados directamente.
    const result = await prisma.$queryRawUnsafe<KpiResult[]>(query, ...params);

    // La agregacion sin GROUP BY siempre devuelve una fila, incluso si no hay ventas.
    return result[0]!;
  }

  async getRevenueTrend(
    filters: RevenueTrendFilters,
  ): Promise<RevenueTrendItem[]> {
    const { conditions, params } = this.buildFilterConditions(filters);

    // El frontend permite agrupar por dia o semana. La expresion se selecciona
    // desde un enum validado en el controlador, por eso no expone SQL arbitrario.
    const periodExpression =
      filters.grain === "week" ? `DATE_TRUNC('week', d.date)::date` : `d.date`;

    // Serie temporal para el grafico: revenue y cantidad de ordenes por periodo.
    const query = `
      SELECT
        ${periodExpression}::text AS period,
        COALESCE(SUM(f.payment_value_allocated), 0)::float AS revenue,
        COUNT(DISTINCT f.order_id)::int AS orders
      FROM gold.fact_sales f
      JOIN gold.dim_date d ON d.date_id = f.date_id
      JOIN gold.dim_order o ON o.order_id = f.order_id
      JOIN gold.dim_customer c ON c.customer_id = f.customer_id
      LEFT JOIN gold.dim_product p ON p.product_id = f.product_id
      WHERE ${conditions.join(" AND ")}
      GROUP BY period
      ORDER BY period;
    `;

    return prisma.$queryRawUnsafe<RevenueTrendItem[]>(query, ...params);
  }

  async getTopProducts(
    filters: ProductRankingFilters,
  ): Promise<ProductRankingItem[]> {
    const { conditions, params } = this.buildFilterConditions(filters);

    // El ranking puede ordenar por GMV o revenue. Igual que grain, metric llega
    // validado desde HTTP y aqui solo cambia una expresion interna permitida.
    const orderMetric =
      filters.metric === "revenue"
        ? "SUM(f.payment_value_allocated)"
        : "SUM(f.item_price)";

    // El LIMIT tambien va parametrizado; queda como ultimo placeholder.
    params.push(filters.limit);

    // Ranking de productos para la tabla del dashboard. Agrupa por producto y
    // categoria, y devuelve ambas metricas aunque el orden use solo una.
    const query = `
    SELECT
      f.product_id AS "productId",
      p.product_category_name_english AS category,
      COALESCE(SUM(f.item_price), 0)::float AS gmv,
      COALESCE(SUM(f.payment_value_allocated), 0)::float AS revenue,
      COUNT(DISTINCT f.order_id)::int AS orders,
      COUNT(f.order_item_id)::int AS items
    FROM gold.fact_sales f
    JOIN gold.dim_date d ON d.date_id = f.date_id
    JOIN gold.dim_order o ON o.order_id = f.order_id
    JOIN gold.dim_customer c ON c.customer_id = f.customer_id
    LEFT JOIN gold.dim_product p ON p.product_id = f.product_id
    WHERE ${conditions.join(" AND ")}
    GROUP BY
      f.product_id,
      p.product_category_name_english
    ORDER BY ${orderMetric} DESC
    LIMIT $${params.length};
  `;

    return prisma.$queryRawUnsafe<ProductRankingItem[]>(query, ...params);
  }
}
