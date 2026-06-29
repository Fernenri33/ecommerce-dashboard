"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Filters } from "@/src/components/Filters";
import { KpiCards } from "@/src/components/KpiCards";
import { ProductRankingTable } from "@/src/components/ProductRankingTable";
import {
  DashboardFilters,
  getKpis,
  getProductRankings,
  getRevenueTrend,
  Kpis,
  ProductRankingItem,
  RevenueTrendItem,
} from "@/src/services/api";

const RevenueTrendChart = dynamic(
  () =>
    import("@/src/components/RevenueTrendChart").then(
      (mod) => mod.RevenueTrendChart
    ),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-xl border border-gray-200 bg-white p-4 text-gray-900 shadow-sm">
        Loading chart...
      </div>
    ),
  }
);

// Filtros iniciales usados para la primera carga del dashboard.
const initialFilters: DashboardFilters = {
  from: "2017-01-01",
  to: "2018-12-31",
  grain: "week",
  metric: "gmv",
  limit: 10,
  status: "",
  state: "",
  category: "",
};

export default function Home() {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters);
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [trend, setTrend] = useState<RevenueTrendItem[]>([]);
  const [ranking, setRanking] = useState<ProductRankingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);

        // Carga los tres bloques de datos en paralelo para actualizar la vista completa.
        const [kpisData, trendData, rankingData] = await Promise.all([
          getKpis(filters),
          getRevenueTrend(filters),
          getProductRankings(filters),
        ]);

        setKpis(kpisData);
        setTrend(trendData);
        setRanking(rankingData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unexpected error");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [filters]);

  return (
    <main className="min-h-screen bg-gray-100 p-6 text-gray-900">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header>
          <h1 className="text-3xl font-bold text-gray-950">
            E-commerce Sales Dashboard
          </h1>
          <p className="mt-1 text-gray-700">
            Olist analytics dashboard using the gold star schema API.
          </p>
        </header>

        <Filters filters={filters} onChange={setFilters} />

        {/* Estados de carga y error para dar feedback al usuario. */}
        {loading && (
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-gray-900 shadow-sm">
            Loading dashboard...
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Cuando ya hay datos, se muestran las tres secciones principales del dashboard. */}
        {!loading && !error && kpis && (
          <>
            <KpiCards data={kpis} />
            <RevenueTrendChart data={trend} />
            <ProductRankingTable data={ranking} />
          </>
        )}
      </div>
    </main>
  );
}