"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RevenueTrendItem } from "@/src/services/api";

type Props = {
  data: RevenueTrendItem[];
};

export function RevenueTrendChart({ data }: Props) {
  return (
    <section className="rounded-xl border bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">Revenue Trend</h2>

      <div className="h-80">
        {/* ResponsiveContainer permite que el grafico se adapte al ancho disponible. */}
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            {/* Barras para revenue y linea para orders dentro del mismo periodo. */}
            <Bar dataKey="revenue" name="Revenue" />
            <Line type="monotone" dataKey="orders" name="Orders" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}