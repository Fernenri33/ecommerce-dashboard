import type { ProductRankingItem } from "@/src/services/api";

type Props = {
  data: ProductRankingItem[];
};

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function ProductRankingTable({ data }: Props) {
  return (
    <section className="rounded-xl border bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">Top Products</h2>

      {/* El overflow evita que la tabla rompa el layout en pantallas pequenas. */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left">
              <th className="p-3">Product ID</th>
              <th className="p-3">Category</th>
              <th className="p-3">GMV</th>
              <th className="p-3">Revenue</th>
              <th className="p-3">Orders</th>
              <th className="p-3">Items</th>
            </tr>
          </thead>

          <tbody>
            {/* Cada fila representa un producto ya ordenado por el backend. */}
            {data.map((product) => (
              <tr key={product.productId} className="border-b">
                <td className="p-3 font-mono text-xs">{product.productId}</td>
                <td className="p-3">{product.category ?? "N/A"}</td>
                <td className="p-3">{money.format(product.gmv)}</td>
                <td className="p-3">{money.format(product.revenue)}</td>
                <td className="p-3">{product.orders}</td>
                <td className="p-3">{product.items}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}