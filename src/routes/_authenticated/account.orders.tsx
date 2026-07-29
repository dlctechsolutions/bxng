import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { getMyOrders } from "@/lib/account.functions";
import { money } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/account/orders")({
  head: () => ({
    meta: [
      { title: "Order History | 44 Boxing" },
      { name: "description", content: "Review your past 44 Boxing orders and their status." },
      { property: "og:title", content: "Order History | 44 Boxing" },
      { property: "og:description", content: "Review your past 44 Boxing orders." },
    ],
  }),
  component: OrdersPage,
});

function OrdersPage() {
  const fetchOrders = useServerFn(getMyOrders);
  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => fetchOrders(),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading orders…</p>;

  if (!orders?.length) {
    return (
      <div className="border border-border p-12 text-center">
        <p className="text-sm text-muted-foreground">You haven't placed an order yet.</p>
        <Button asChild className="mt-6">
          <Link to="/collections/$slug" params={{ slug: "luxe" }}>
            Explore all boxing gloves
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {orders.map((order) => (
        <article key={order.id} className="border border-border">
          <header className="grid gap-3 border-b border-border p-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <div className="min-w-0">
              <h2 className="truncate text-base">Order {order.order_number}</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(order.created_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                {" · "}
                <span className="uppercase tracking-widest">{order.status}</span>
              </p>
            </div>
            <p className="shrink-0 text-base font-semibold tabular-nums">{money(Number(order.total))}</p>
          </header>
          <ul className="divide-y divide-border">
            {order.order_items.map((item) => (
              <li key={item.id} className="flex items-center gap-4 p-6">
                <img
                  src={item.image ?? "/images/prod-luxe-onyx.jpg"}
                  alt={item.name}
                  loading="lazy"
                  width={128}
                  height={128}
                  className="size-16 shrink-0 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{item.name}</p>
                  {item.variant_label && (
                    <p className="mt-1 text-xs text-muted-foreground">{item.variant_label}</p>
                  )}
                </div>
                <p className="shrink-0 text-sm tabular-nums text-muted-foreground">
                  {item.quantity} × {money(Number(item.unit_price))}
                </p>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}
