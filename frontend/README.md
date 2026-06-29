# Frontend - E-commerce Analytics Dashboard

Frontend desarrollado con **Next.js**, **TypeScript**, **Tailwind CSS** y **Recharts** para visualizar KPIs de ventas del dataset Olist.

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Recharts

## Requisitos

- Node.js 22+
- Backend corriendo en `http://localhost:3000`

## Instalación

```bash
cd frontend
npm install
````

## Variables de entorno

Crear un archivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Ejecución en desarrollo

Si el backend usa el puerto `3000`, ejecutar el frontend en `3001`:

```bash
npm run dev -- --port 3001
```

URL:

```txt
http://localhost:3001
```

## Build de producción

```bash
npm run build
npm run start
```

## Docker

El frontend también puede ejecutarse con Docker Compose desde la raíz del proyecto:

```bash
docker compose up
```

URL:

```txt
http://localhost:3001
```

## Funcionalidad

El dashboard consume únicamente la API del backend. No consulta la base de datos directamente.

Incluye:

* Filtros globales:

  * Fecha inicial
  * Fecha final
  * Estado de orden
  * Estado del cliente
  * Categoría de producto
  * Métrica del ranking
  * Granularidad del gráfico

* KPIs:

  * GMV
  * Revenue
  * Shipping
  * Orders
  * AOV
  * Items per Order
  * Cancellation Rate
  * On-Time Delivery Rate

* Gráfico:

  * Revenue Trend
  * Orders

* Tabla:

  * Top productos por GMV o Revenue

## Endpoints consumidos

```txt
GET /kpis
GET /trend/revenue
GET /rankings/products
```

## Estructura principal

```txt
src/
├── app/
│   └── page.tsx
├── components/
│   ├── Filters.tsx
│   ├── KpiCards.tsx
│   ├── RevenueTrendChart.tsx
│   └── ProductRankingTable.tsx
└── services/
    └── api.ts
```

## Manejo de errores

El frontend muestra mensajes de error enviados por el backend, por ejemplo:

```txt
date range must be between 2016-01-01 and 2018-12-31
```

Esto permite validar correctamente filtros inválidos sin ocultar errores de negocio.

## Nota técnica

El gráfico usa `dynamic import` con `ssr: false` para evitar problemas de hidratación entre Next.js y Recharts.
