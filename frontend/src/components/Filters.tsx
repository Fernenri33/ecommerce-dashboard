import type { DashboardFilters } from "@/src/services/api";

type Props = {
  filters: DashboardFilters;
  onChange: (filters: DashboardFilters) => void;
};

export function Filters({ filters, onChange }: Props) {
  // Actualiza un solo filtro conservando el resto del estado actual.
  function update<K extends keyof DashboardFilters>(
    key: K,
    value: DashboardFilters[K]
  ) {
    onChange({
      ...filters,
      [key]: value,
    });
  }

  return (
    <section className="rounded-xl border bg-white p-4 shadow-sm">
      {/* Estos controles modifican el estado de filtros que vive en app/page.tsx. */}
      <div className="grid gap-4 md:grid-cols-4">
        <div>
          <label className="text-sm font-medium">From</label>
          <input
            min="2016-01-01"
            max="2018-12-31"
            type="date"
            value={filters.from}
            onChange={(e) => update("from", e.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium">To</label>
          <input
            type="date"
            min="2016-01-01"
            max="2018-12-31"
            value={filters.to}
            onChange={(e) => update("to", e.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Grain</label>
          <select
            value={filters.grain}
            onChange={(e) => update("grain", e.target.value as "day" | "week")}
            className="mt-1 w-full rounded-md border px-3 py-2"
          >
            <option value="week">Week</option>
            <option value="day">Day</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Ranking Metric</label>
          <select
            value={filters.metric}
            onChange={(e) =>
              update("metric", e.target.value as "gmv" | "revenue")
            }
            className="mt-1 w-full rounded-md border px-3 py-2"
          >
            <option value="gmv">GMV</option>
            <option value="revenue">Revenue</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Status</label>
          <input
            value={filters.status ?? ""}
            onChange={(e) => update("status", e.target.value)}
            placeholder="delivered, canceled..."
            className="mt-1 w-full rounded-md border px-3 py-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium">State</label>
          <input
            value={filters.state ?? ""}
            // Los estados de Brasil se consultan como codigos en mayuscula: SP, RJ, MG.
            onChange={(e) => update("state", e.target.value.toUpperCase())}
            placeholder="SP, RJ, MG..."
            className="mt-1 w-full rounded-md border px-3 py-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Category</label>
          <input
            value={filters.category ?? ""}
            onChange={(e) => update("category", e.target.value)}
            placeholder="beleza_saude..."
            className="mt-1 w-full rounded-md border px-3 py-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Limit</label>
          <input
            type="number"
            min={1}
            max={50}
            value={filters.limit}
            onChange={(e) => update("limit", Number(e.target.value))}
            className="mt-1 w-full rounded-md border px-3 py-2"
          />
        </div>
      </div>
    </section>
  );
}