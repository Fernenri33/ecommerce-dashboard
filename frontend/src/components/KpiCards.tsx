import type { Kpis } from "@/src/services/api";

type Props = {
  data: Kpis;
};

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const number = new Intl.NumberFormat("en-US");

function percent(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}

export function KpiCards({ data }: Props) {
  // Convierte la respuesta de la API en tarjetas listas para pintar.
  const cards = [
    { label: "GMV", value: money.format(data.gmv) },
    { label: "Revenue", value: money.format(data.revenue) },
    { label: "Shipping", value: money.format(data.shipping) },
    { label: "Orders", value: number.format(data.orders) },
    { label: "AOV", value: money.format(data.aov) },
    { label: "Items / Order", value: data.itemsPerOrder.toFixed(2) },
    { label: "Cancellation Rate", value: percent(data.cancellationRate) },
    { label: "On-Time Delivery", value: percent(data.onTimeDeliveryRate) },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <article
          key={card.label}
          className="rounded-xl border bg-white p-4 shadow-sm"
        >
          <p className="text-sm text-gray-900">{card.label}</p>
          <strong className="mt-2 block text-2xl">{card.value}</strong>
        </article>
      ))}
    </section>
  );
}