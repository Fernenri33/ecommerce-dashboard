# E-commerce Analytics Dashboard

## Descripción General

Este proyecto implementa una plataforma analítica para el dataset de Olist utilizando una arquitectura de Data Warehouse compuesta por las capas Raw, Clean y Gold.

La solución incluye:

* Proceso ETL para carga y transformación de datos.
* Data Warehouse en PostgreSQL.
* Modelo dimensional tipo Star Schema.
* API REST desarrollada con Express y TypeScript.
* Prisma ORM.
* Arquitectura Hexagonal.
* Dashboard desarrollado con Next.js.
* Docker Compose para despliegue local.
* Pruebas unitarias e integración.

---

# Tecnologías Utilizadas

## Backend

* Node.js
* Express
* TypeScript
* Prisma ORM
* PostgreSQL
* Vitest

## Frontend

* Next.js 16
* React 19
* TypeScript
* Tailwind CSS
* Recharts

## Infraestructura

* Docker
* Docker Compose

---

# Arquitectura General

```txt
                 ┌─────────────────┐
                 │   CSV Olist     │
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │      RAW        │
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │     CLEAN       │
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │      GOLD       │
                 │  Star Schema    │
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │    Backend      │
                 │ Express + TS    │
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │    Frontend     │
                 │    Next.js      │
                 └─────────────────┘
```

---

# Arquitectura Backend

El backend fue implementado utilizando Arquitectura Hexagonal.

```txt
src
├── adapters
│   └── http
│       ├── controllers
│       ├── routes
│       └── validators
│
├── application
│   └── use-cases
│
├── domain
│   └── repositories
│
└── infrastructure
    ├── database
    ├── repositories
    └── seed
```

## Responsabilidades

### Adapters

Exponen la API HTTP.

### Application

Contiene casos de uso y lógica de aplicación.

### Domain

Define contratos y abstracciones.

### Infrastructure

Implementaciones concretas de Prisma, ETL y acceso a datos.

---

# Modelo Estrella (Gold Layer)

La capa Gold fue diseñada utilizando un esquema estrella para optimizar consultas analíticas.

## Grano

```txt
1 fila = 1 item de orden
(order_id + order_item_id)
```

---

## Tabla de Hechos

| Tabla           | Descripción                        |
| --------------- | ---------------------------------- |
| gold.fact_sales | Métricas de ventas a nivel de item |

---

## Dimensiones

| Tabla             | Descripción          |
| ----------------- | -------------------- |
| gold.dim_date     | Información temporal |
| gold.dim_customer | Cliente y ubicación  |
| gold.dim_product  | Producto y categoría |
| gold.dim_order    | Estado de orden      |

---

## Diagrama

```txt
                 dim_date
                     |
                     |
dim_customer --- fact_sales --- dim_product
                     |
                     |
                 dim_order
```

---

# Tablas Cargadas en Raw

Las siguientes tablas se cargan directamente desde los archivos CSV originales.

| CSV                                   | Tabla Raw                |
| ------------------------------------- | ------------------------ |
| olist_customers_dataset.csv           | raw.customers            |
| olist_orders_dataset.csv              | raw.orders               |
| olist_order_items_dataset.csv         | raw.order_items          |
| olist_order_payments_dataset.csv      | raw.order_payments       |
| olist_products_dataset.csv            | raw.products             |
| product_category_name_translation.csv | raw.category_translation |

---

# Reglas de Limpieza (Clean)

Durante la carga hacia la capa Clean se aplican las siguientes transformaciones:

* Conversión de tipos de datos.
* Normalización de fechas.
* Estandarización de claves.
* Preparación de relaciones entre entidades.
* Resolución de categorías en inglés.
* Eliminación de registros inválidos.
* Preparación de datos para reportería.

---

# Regla de Asignación de Payment Value

## Problema

El dataset original almacena pagos a nivel de orden.

```txt
order_payments
```

Sin embargo, la tabla de hechos trabaja a nivel de item.

```txt
fact_sales
```

---

## Solución

El valor pagado fue distribuido proporcionalmente entre los productos de cada orden.

### Fórmula

```txt
payment_value_allocated =
payment_value *
(item_price / total_order_items_price)
```

---

## Ejemplo

Orden:

```txt
Pago total = 100
```

Items:

```txt
Producto A = 20
Producto B = 30
Producto C = 50
```

Asignación:

```txt
Producto A = 20
Producto B = 30
Producto C = 50
```

De esta forma se evita duplicar ingresos al trabajar a nivel item.

---

# KPIs Implementados

## GMV

Valor bruto de mercancía vendida.

```sql
SUM(item_price)
```

---

## Shipping

Costo total de envío.

```sql
SUM(freight_value)
```

---

## Revenue

Ingresos reales asignados por item.

```sql
SUM(payment_value_allocated)
```

---

## Orders

Cantidad de órdenes únicas.

```sql
COUNT(DISTINCT order_id)
```

---

## Items

Cantidad total de productos vendidos.

```sql
COUNT(order_item_id)
```

---

## AOV

Average Order Value.

```txt
Revenue / Orders
```

---

## Items Per Order

Promedio de productos por orden.

```txt
Items / Orders
```

---

## Cancellation Rate

Porcentaje de órdenes canceladas.

```txt
Canceled Orders / Total Orders
```

---

## On Time Delivery Rate

Porcentaje de entregas realizadas a tiempo.

```txt
On Time Deliveries / Delivered Orders
```

---

# Endpoints

## Health Check

```http
GET /health
```

---

## KPIs

```http
GET /kpis
```

Parámetros:

```txt
from
to
status
state
category
```

---

## Revenue Trend

```http
GET /trend/revenue
```

Parámetros:

```txt
from
to
grain
status
state
category
```

---

## Product Ranking

```http
GET /rankings/products
```

Parámetros:

```txt
from
to
metric
limit
status
state
category
```

---

# Validaciones

Las fechas son validadas antes de ejecutar consultas.

Rango permitido:

```txt
2016-01-01
2018-12-31
```

Ejemplo:

```json
{
  "message": "date range must be between 2016-01-01 and 2018-12-31"
}
```

---

# Frontend

## Funcionalidades

### Filtros

* Fecha inicial
* Fecha final
* Estado de orden
* Estado de cliente
* Categoría
* Métrica de ranking
* Granularidad

### KPIs

* GMV
* Revenue
* Shipping
* Orders
* AOV
* Items Per Order
* Cancellation Rate
* On Time Delivery Rate

### Revenue Trend

Visualización temporal de ingresos.

### Ranking de Productos

Ranking por:

* GMV
* Revenue

---

# Setup

## Backend

```bash
cd backend

npm install

npm run dev
```

Backend:

```txt
http://localhost:3000
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev -- --port 3001
```

Frontend:

```txt
http://localhost:3001
```

---

# ETL

Ejecutar:

```bash
npm run etl
```

El proceso:

1. Crea esquemas.
2. Crea tablas Raw.
3. Crea tablas Clean.
4. Crea tablas Gold.
5. Importa CSV.
6. Carga dimensiones.
7. Carga tabla de hechos.

---

# Docker

Levantar servicios:

```bash
docker compose up
```

Servicios incluidos:

* PostgreSQL
* Backend
* Frontend

---

# Testing

Framework:

```txt
Vitest
```

Ejecutar:

```bash
npm test
```

Cobertura:

* Validación de fechas.
* Casos de uso KPI.
* Casos de uso Ranking.
* Integración de rutas.

---

# Decisiones Técnicas y Tradeoffs

## Star Schema

### Ventajas

* Consultas rápidas.
* Agregaciones eficientes.
* Mejor experiencia analítica.

### Tradeoff

* Redundancia controlada en dimensiones.

---

## Prisma

### Ventajas

* Tipado fuerte.
* Productividad.
* Integración sencilla.

### Tradeoff

* Algunas consultas analíticas complejas requirieron SQL nativo mediante `queryRaw`.

---

## Arquitectura Hexagonal

### Ventajas

* Separación de responsabilidades.
* Alta mantenibilidad.
* Fácil testing.

### Tradeoff

* Mayor cantidad de archivos para proyectos pequeños.

---

## ETL Separado de la API

### Ventajas

* Independencia entre procesamiento y consumo.
* Reprocesamiento sencillo.

### Tradeoff

* Requiere una carga inicial antes de exponer datos.

---

# Autor

Fernando Enrique

Prueba Técnica – E-commerce Analytics Dashboard
