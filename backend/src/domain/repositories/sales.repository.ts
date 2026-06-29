// Tipos del dominio: describen los filtros y respuestas que entiende la capa
// de negocio, sin depender de Express, Prisma ni de detalles de PostgreSQL.
export type KpiFilters = {
  from: string;
  to: string;
  status?: string;
  state?: string;
  category?: string;
};

// Resumen numerico que alimenta las cards principales del dashboard.
export type KpiResult = {
  gmv: number;
  shipping: number;
  revenue: number;
  orders: number;
  items: number;
  aov: number;
  itemsPerOrder: number;
  cancellationRate: number;
  onTimeDeliveryRate: number;
};

// Extiende los filtros base con la granularidad temporal del grafico.
export type RevenueTrendFilters = KpiFilters & {
  grain: "day" | "week";
};

export type RevenueTrendItem = {
  period: string;
  revenue: number;
  orders: number;
};

// Extiende los filtros base con la metrica de orden y el tamano del ranking.
export type ProductRankingFilters = KpiFilters & {
  metric: "gmv" | "revenue";
  limit: number;
};

export type ProductRankingItem = {
  productId: string;
  category: string | null;
  gmv: number;
  revenue: number;
  orders: number;
  items: number;
};

// Puerto de salida de la arquitectura hexagonal. Los casos de uso dependen de
// esta interfaz y no de PrismaSalesRepository, lo que permite testear con mocks.
export interface SalesRepository {
  getKpis(filters: KpiFilters): Promise<KpiResult>;

  getRevenueTrend(
    filters: RevenueTrendFilters,
  ): Promise<RevenueTrendItem[]>;

  getTopProducts(
    filters: ProductRankingFilters,
  ): Promise<ProductRankingItem[]>;
}
