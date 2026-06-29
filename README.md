# E-commerce Analytics Dashboard

## Descripción General

Este proyecto implementa un dashboard analítico utilizando el dataset público de Olist.

La solución incluye:

* Arquitectura Data Warehouse (Raw → Clean → Gold)
* Proceso ETL para importación de archivos CSV
* PostgreSQL
* Backend con Express y TypeScript
* Prisma ORM
* Arquitectura Hexagonal
* Frontend con Next.js
* Docker Compose
* Pruebas unitarias e integración

La API expone métricas analíticas construidas exclusivamente sobre la capa Gold utilizando un esquema estrella (Star Schema).

---

# Arquitectura General

## Flujo de Datos

```txt
Archivos CSV
     │
     ▼
   Raw
     │
     ▼
  Clean
     │
     ▼
Gold (Star Schema)
     │
     ▼
 API Express
     │
     ▼
 Dashboard Next.js
```

---

# Data Warehouse

## Capa Raw

Almacena los archivos CSV originales sin transformaciones.

Objetivos:

* Preservación de datos
* Trazabilidad
* Reprocesamiento

---

## Capa Clean

Capa normalizada utilizada para limpieza y transformación de datos.

Objetivos:

* Estandarización
* Normalización
* Preparación para análisis

---

## Capa Gold

Capa analítica optimizada para consultas de reportería y dashboards.

### Tabla de Hechos

```txt
gold.fact_sales
```

Grano:

```txt
1 fila = 1 item de orden
```

### Dimensiones

```txt
gold.dim_date
gold.dim_customer
gold.dim_product
gold.dim_order
```

Todas las consultas de la API se realizan únicamente sobre esta capa.

---

# Backend

## Tecnologías

* Node.js
* Express
* TypeScript
* Prisma ORM
* PostgreSQL
* Vitest

---

## Arquitectura Hexagonal

Estructura principal:

```txt
src
├── adapters
├── application
├── domain
└── infrastructure
```

### Adapters

Responsables de exponer la API HTTP.

Ejemplos:

* Controllers
* Routes
* Validators

### Application

Contiene los casos de uso y reglas de negocio.

### Domain

Define contratos y abstracciones del sistema.

### Infrastructure

Implementaciones concretas:

* Prisma
* ETL
* Repositorios
* Base de datos

---

# API

## Health Check

```http
GET /health
```

Permite verificar el estado de la aplicación.

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

Respuesta:

```json
{
  "gmv": 0,
  "shipping": 0,
  "revenue": 0,
  "orders": 0,
  "items": 0,
  "aov": 0,
  "itemsPerOrder": 0,
  "cancellationRate": 0,
  "onTimeDeliveryRate": 0
}
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

Permite visualizar la evolución de ingresos por día o semana.

---

## Ranking de Productos

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

Métricas disponibles:

```txt
gmv
revenue
```

---

# Validaciones

Las fechas son validadas antes de ejecutar consultas.

Rango permitido:

```txt
2016-01-01
hasta
2018-12-31
```

Ejemplos de validaciones:

* Formato inválido
* Rango invertido
* Fechas fuera del rango del dataset

Ejemplo de respuesta:

```json
{
  "message": "date range must be between 2016-01-01 and 2018-12-31"
}
```

---

# ETL

El proceso ETL se encuentra en:

```txt
src/infrastructure/seed/run-etl.ts
```

Ejecución:

```bash
npm run etl
```

El proceso realiza:

1. Creación de esquemas.
2. Creación de tablas Raw.
3. Creación de tablas Clean.
4. Creación de tablas Gold.
5. Importación de archivos CSV.
6. Carga de dimensiones.
7. Carga de tabla de hechos.

---

# Frontend

## Tecnologías

* Next.js 16
* React 19
* TypeScript
* Tailwind CSS
* Recharts

---

## Funcionalidades

### Filtros

* Fecha inicial
* Fecha final
* Estado de orden
* Estado del cliente
* Categoría de producto
* Métrica del ranking
* Granularidad del gráfico

---

### KPIs

Se muestran los siguientes indicadores:

* GMV
* Revenue
* Shipping
* Orders
* AOV
* Items por Orden
* Tasa de Cancelación
* Entregas a Tiempo

---

### Revenue Trend

Gráfico de evolución temporal de ingresos.

Soporta agrupación:

```txt
day
week
```

---

### Ranking de Productos

Tabla con los productos más relevantes según:

```txt
GMV
Revenue
```

---

# Docker

El proyecto incluye contenedores para:

* PostgreSQL
* Backend
* Frontend

Levantar servicios:

```bash
docker compose up
```

---

# Ejecución Local

## Backend

```bash
cd backend

npm install

npm run dev
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev -- --port 3001
```

---

# Pruebas

Framework utilizado:

```txt
Vitest
```

Ejecución:

```bash
npm test
```

Cobertura principal:

* Validación de fechas
* Casos de uso KPI
* Casos de uso Ranking
* Integración de rutas

---

# Decisiones Técnicas

## ¿Por qué Star Schema?

El objetivo principal es analítico y no transaccional.

Beneficios:

* Consultas agregadas más rápidas
* Menor complejidad en reportería
* Escalabilidad para análisis

---

## ¿Por qué Arquitectura Hexagonal?

Beneficios:

* Separación de responsabilidades
* Facilidad de pruebas
* Independencia de infraestructura
* Mejor mantenibilidad

---

## ¿Por qué Prisma?

Beneficios:

* Consultas tipadas
* Integración sencilla con PostgreSQL
* Mejor experiencia de desarrollo
* Menor complejidad de acceso a datos

---

# Autor

Fernando Portillo

Prueba Técnica – E-commerce Analytics Dashboard
