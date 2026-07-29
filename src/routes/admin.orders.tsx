import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { adminListOrders, adminUpdateOrderStatus } from "@/lib/admin.functions";
import { money } from "@/lib/format";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"];

function AdminOrders() {
  const list = useServerFn(adminListOrders);
  const setStatus = useServerFn(adminUpdateOrderStatus);
  const queryClient = useQueryClient();
  const [open, setOpen] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

  const orders = useQuery({ queryKey: ["admin", "orders"], queryFn: () => list({}) });

  const update = useMutation({
    mutationFn: (v: { id: string; status: string }) => setStatus({ data: v }),
    onSuccess: () => {
      toast.success("Order updated");
      queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Update failed"),
  });

  const rows = (orders.data ?? []).filter((o: any) => filter === "all" || o.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg">Orders ({orders.data?.length ?? 0})</h2>
        <select
          className="h-10 border border-input bg-background px-3 text-sm"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {orders.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No orders here yet.</p>
      ) : (
        <div className="space-y-3">
          {rows.map((o: any) => (
            <div key={o.id} className="border border-border bg-card">
              <button
                className="flex w-full flex-wrap items-center justify-between gap-4 p-4 text-left"
                onClick={() => setOpen(open === o.id ? null : o.id)}
              >
                <div>
                  <p className="text-sm">{o.order_number}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(o.created_at).toLocaleString("en-GB")} · {o.email ?? "no email"}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm">{money(o.total)}</span>
                  <span className="text-[0.6rem] uppercase tracking-[0.2em] text-primary">{o.status}</span>
                </div>
              </button>
              {open === o.id && (
                <div className="border-t border-border p-4">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <p className="text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">Items</p>
                      <ul className="mt-3 space-y-2 text-sm">
                        {(o.order_items ?? []).map((i: any) => (
                          <li key={i.id} className="flex justify-between gap-4">
                            <span>
                              {i.quantity} × {i.name}
                              {i.variant_label ? ` — ${i.variant_label}` : ""}
                            </span>
                            <span>{money(Number(i.unit_price) * i.quantity)}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-4 text-sm text-muted-foreground">
                        Subtotal {money(o.subtotal)} · Shipping {money(o.shipping)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
                        Shipping address
                      </p>
                      <pre className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
                        {Object.values(o.shipping_address ?? {}).filter(Boolean).join("\n")}
                      </pre>
                      <div className="mt-4">
                        <p className="text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
                          Status
                        </p>
                        <select
                          className="mt-2 h-10 w-full border border-input bg-background px-3 text-sm"
                          value={o.status}
                          onChange={(e) => update.mutate({ id: o.id, status: e.target.value })}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
