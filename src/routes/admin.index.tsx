import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAdminOverview } from "@/lib/admin.functions";
import { money } from "@/lib/format";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-border bg-card p-6">
      <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-3 text-3xl">{value}</p>
    </div>
  );
}

function AdminDashboard() {
  const fetchOverview = useServerFn(getAdminOverview);
  const { data, isLoading } = useQuery({ queryKey: ["admin", "overview"], queryFn: () => fetchOverview({}) });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!data) return null;

  return (
    <div className="space-y-10">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="Revenue" value={money(data.revenue)} />
        <Stat label="Orders" value={data.orderCount} />
        <Stat label="Customers" value={data.customerCount} />
        <Stat label="Products" value={data.productCount} />
        <Stat label="Collections" value={data.collectionCount} />
        <Stat label="Out-of-stock variants" value={data.outOfStockVariants} />
      </div>

      <div>
        <h2 className="text-lg">Latest orders</h2>
        {data.recent.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No orders yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto border border-border">
            <table className="w-full text-sm">
              <thead className="bg-secondary text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
                <tr>
                  <th className="p-3 text-left">Order</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.recent.map((o: any) => (
                  <tr key={o.id} className="border-t border-border">
                    <td className="p-3">{o.order_number}</td>
                    <td className="p-3 text-muted-foreground">{o.email ?? "—"}</td>
                    <td className="p-3 uppercase text-[0.65rem] tracking-[0.15em]">{o.status}</td>
                    <td className="p-3 text-right">{money(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
