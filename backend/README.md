Aquí tienes un `README.md` para el backend:

````md
# E-Commerce Analytics Dashboard - Backend

Backend API para un dashboard analítico de e-commerce basado en el dataset público de Olist.

El proyecto implementa una arquitectura hexagonal con Express, TypeScript, Prisma 7 y PostgreSQL. La base de datos está organizada en capas `raw`, `clean` y `gold`, donde `gold` contiene un esquema estrella usado por la API.

---

## Stack principal

- Node.js
- Express
- TypeScript
- PostgreSQL
- Prisma 7
- Prisma PostgreSQL Adapter
- Vitest
- Supertest
- csv-parse
- pg

---

## Estructura general

```txt
backend/
├── data/
│   └── CSV files from Olist dataset
├── prisma/
│   └── schema.prisma
├── sql/
│   ├── 001_create_schemas.sql
│   ├── 002_create_raw_tables.sql
│   ├── 003_create_clean_tables.sql
│   ├── 004_create_gold_tables.sql
│   ├── 005_raw_to_clean.sql
│   └── 006_clean_to_gold.sql
├── src/
│   ├── adapters/
│   │   └── http/
│   ├── application/
│   │   └── use-cases/
│   ├── domain/
│   │   └── repositories/
│   └── infrastructure/
│       ├── database/
│       ├── repositories/
│       └── seed/
├── package.json
├── prisma.config.ts
├── tsconfig.json
└── vitest.config.ts
````

---

## Variables de entorno

Crear un archivo `.env` en la raíz del backend:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ecommerce_dashboard"
PORT=3000
```

---

## Instalación

```bash
npm install
```

Generar Prisma Client:

```bash
npx prisma generate
```

---

## Scripts disponibles

```bash
npm run dev
```

Levanta el servidor en modo desarrollo.

```bash
npm run build
```

Compila TypeScript.

```bash
npm start
```

Ejecuta la versión compilada.

```bash
npm run etl
```

Ejecuta el proceso completo de importación y transformación de datos.

```bash
npm test
```

Ejecuta pruebas unitarias e integración.

---

## Flujo ETL

El backend incluye un comando one-shot para construir el modelo analítico desde los CSV.

```bash
npm run etl
```

El flujo es:

```txt
CSV files
   ↓
raw schema
   ↓
clean schema
   ↓
gold schema
   ↓
API
```

### 1. Capa raw

La capa `raw` carga los CSV casi tal cual vienen desde la fuente original.

Ejemplo:

```txt
olist_orders_dataset.csv → raw.orders
olist_products_dataset.csv → raw.products
olist_order_items_dataset.csv → raw.order_items
```

En esta capa los campos se mantienen principalmente como `TEXT` para facilitar la carga inicial y conservar la fuente original.

### 2. Capa clean

La capa `clean` convierte los datos a tipos correctos y aplica limpieza básica:

* Conversión de fechas a `TIMESTAMP`.
* Conversión de montos a `NUMERIC`.
* Conversión de cantidades a `INTEGER`.
* Normalización de textos con `TRIM`, `LOWER` y `UPPER`.
* Manejo de valores vacíos con `NULLIF`.
* Definición de claves primarias y relaciones principales.

Ejemplo:

```sql
NULLIF(TRIM(order_purchase_timestamp), '')::TIMESTAMP
```

### 3. Capa gold

La capa `gold` contiene el modelo analítico en esquema estrella.

Tablas principales:

```txt
gold.fact_sales
gold.dim_date
gold.dim_customer
gold.dim_product
gold.dim_order
```

El grano de `gold.fact_sales` es:

```txt
1 fila por ítem de orden
(order_id + order_item_id)
```

La tabla `fact_sales` contiene las medidas principales:

* `item_price`
* `freight_value`
* `payment_value_allocated`
* `is_delivered`
* `is_canceled`
* `is_on_time`

Las dimensiones contienen atributos para filtros y agrupaciones:

* Fecha
* Cliente
* Producto
* Orden

---

## Regla de asignación de payment_value

En el dataset, `payment_value` está a nivel de orden, pero `fact_sales` está a nivel de ítem de orden.

Por eso, el valor pagado se distribuye entre los ítems de una orden:

```sql
total_payment / number_of_items_in_order
```

Esto permite calcular revenue desde `gold.fact_sales` manteniendo el grano solicitado.

---

## Uso de Prisma

Prisma 7 se utiliza como cliente de acceso a la base de datos dentro de la capa de infraestructura.

La API no consulta directamente `raw` ni `clean`.

Todas las consultas analíticas salen de:

```txt
gold.fact_sales
```

con joins permitidos hacia dimensiones.

Ejemplo de flujo:

```txt
HTTP Controller
   ↓
Use Case
   ↓
SalesRepository interface
   ↓
PrismaSalesRepository
   ↓
PostgreSQL gold schema
```

Aunque se usa Prisma, las consultas analíticas principales se implementan con SQL raw parametrizado mediante Prisma, porque los KPIs requieren operaciones como:

* `SUM`
* `COUNT DISTINCT`
* `GROUP BY`
* `DATE_TRUNC`
* filtros dinámicos
* rankings

Esta decisión mantiene el control sobre las consultas analíticas y evita forzar el ORM en casos donde SQL es más expresivo.

---

## Arquitectura hexagonal

El backend separa responsabilidades en capas:

### `src/domain`

Contiene contratos e interfaces del dominio.

Ejemplo:

```txt
SalesRepository
```

Define qué operaciones necesita la aplicación sin depender de Prisma, PostgreSQL o Express.

### `src/application`

Contiene casos de uso.

Ejemplos:

```txt
GetKpisUseCase
GetRevenueTrendUseCase
GetTopProductsUseCase
```

Los casos de uso dependen de interfaces, no de implementaciones concretas.

### `src/infrastructure`

Contiene implementaciones técnicas:

* Prisma Client
* Repositorios Prisma
* Scripts ETL
* Acceso a PostgreSQL

### `src/adapters/http`

Contiene Express:

* Rutas
* Controllers
* Validadores HTTP

---

## Endpoints

### Health check

```http
GET /health
```

Respuesta:

```json
{
  "status": "ok"
}
```

---

### KPIs

```http
GET /kpis?from=YYYY-MM-DD&to=YYYY-MM-DD
```

Filtros opcionales:

```txt
status
state
category
```

Ejemplo:

```http
GET /kpis?from=2017-01-01&to=2018-12-31&state=SP
```

Devuelve:

* GMV
* Shipping
* Revenue
* Orders
* Items
* AOV
* Items per Order
* Cancellation Rate
* On-Time Delivery Rate

---

### Revenue Trend

```http
GET /trend/revenue?from=YYYY-MM-DD&to=YYYY-MM-DD&grain=day|week
```

Ejemplo:

```http
GET /trend/revenue?from=2017-01-01&to=2018-12-31&grain=week
```

Devuelve una serie temporal con:

* Periodo
* Revenue
* Orders

---

### Product Rankings

```http
GET /rankings/products?from=YYYY-MM-DD&to=YYYY-MM-DD&metric=gmv|revenue&limit=10
```

Ejemplo:

```http
GET /rankings/products?from=2017-01-01&to=2018-12-31&metric=gmv&limit=10
```

Devuelve ranking de productos por:

* GMV
* Revenue
* Orders
* Items

---

## Validaciones

Los endpoints validan:

* `from` y `to` obligatorios.
* Formato de fecha `YYYY-MM-DD`.
* Rango válido: `from <= to`.
* `grain` permitido: `day` o `week`.
* `metric` permitido: `gmv` o `revenue`.
* `limit` entre 1 y 50.

---

## Tests

El proyecto usa Vitest y Supertest.

Ejecutar:

```bash
npm test
```

Cobertura actual:

```txt
Unit tests:
- validateDateRange
- GetKpisUseCase
- GetTopProductsUseCase

Integration test:
- GET /health
```

Resultado esperado:

```txt
Test Files  4 passed
Tests       6 passed
```

---

## Decisiones técnicas

### Prisma + SQL raw

Se usa Prisma como cliente de infraestructura para cumplir el requerimiento de ORM y centralizar el acceso a la base de datos.

Las consultas analíticas usan SQL raw parametrizado porque el backend trabaja sobre un esquema estrella y requiere agregaciones complejas. Esto es más claro y eficiente que forzar consultas analíticas con métodos CRUD del ORM.

### API solo sobre gold

El backend no consulta `raw` ni `clean`.

Esto mantiene separada la responsabilidad de cada capa:

```txt
raw   = datos originales
clean = datos limpiados y tipados
gold  = modelo analítico para consumo
```

### Esquema estrella

El modelo `gold` está optimizado para reportes y dashboards, no para operaciones CRUD transaccionales.

---