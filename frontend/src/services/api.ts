const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Forma comun de los filtros que viajan como query params hacia el backend.
export type DashboardFilters = {
  from: string;
  to: string;
  grain: "day" | "week";
  metric: "gmv" | "revenue";
  limit: number;
  status?: string;
  state?: string;
  category?: string;
};

export type Kpis = {
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

export type RevenueTrendItem = {
  period: string;
  revenue: number;
  orders: number;
};

export type ProductRankingItem = {
  productId: string;
  category: string | null;
  gmv: number;
  revenue: number;
  orders: number;
  items: number;
};

function buildQuery(filters: Partial<DashboardFilters>) {
  const params = new URLSearchParams();

  // Evita enviar parametros vacios para que el backend use sus valores por defecto.
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });

  return params.toString();
}

async function request<T>(path: string): Promise<T> {
  // Wrapper generico para mantener en un solo lugar el manejo de errores HTTP.
  const response = await fetch(`${API_URL}${path}`, {
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ??
      `Error ${response.status}: ${response.statusText}`
    );
  }

  return data;
}

export function getKpis(filters: DashboardFilters) {
  // Los KPIs solo necesitan filtros de contexto, no metrica ni granularidad.
  const query = buildQuery({
    from: filters.from,
    to: filters.to,
    status: filters.status,
    state: filters.state,
    category: filters.category,
  });

  return request<Kpis>(`/kpis?${query}`);
}

export function getRevenueTrend(filters: DashboardFilters) {
  // La tendencia usa grain para agrupar los puntos por dia o por semana.
  const query = buildQuery({
    from: filters.from,
    to: filters.to,
    grain: filters.grain,
    status: filters.status,
    state: filters.state,
    category: filters.category,
  });

  return request<RevenueTrendItem[]>(`/trend/revenue?${query}`);
}

export function getProductRankings(filters: DashboardFilters) {
  // El ranking usa metric y limit para decidir como ordenar y cuantos productos traer.
  const query = buildQuery({
    from: filters.from,
    to: filters.to,
    metric: filters.metric,
    limit: filters.limit,
    status: filters.status,
    state: filters.state,
    category: filters.category,
  });

  return request<ProductRankingItem[]>(`/rankings/products?${query}`);
}