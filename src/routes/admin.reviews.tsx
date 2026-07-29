import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Stars } from "@/components/site/ProductReviews";
import {
  adminDeleteReview,
  adminListReviews,
  adminSetReviewStatus,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/reviews")({
  component: AdminReviews,
});

const STATUSES = ["pending", "approved", "rejected"] as const;

function AdminReviews() {
  const list = useServerFn(adminListReviews);
  const setStatus = useServerFn(adminSetReviewStatus);
  const del = useServerFn(adminDeleteReview);
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string>("pending");

  const reviews = useQuery({ queryKey: ["admin", "reviews"], queryFn: () => list({}) });

  const moderate = useMutation({
    mutationFn: (v: { id: string; status: string }) => setStatus({ data: v }),
    onSuccess: () => {
      toast.success("Review updated");
      queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Update failed"),
  });

  const destroy = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => {
      toast.success("Review deleted");
      queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Delete failed"),
  });

  const all = reviews.data ?? [];
  const rows = all.filter((r: any) => filter === "all" || r.status === filter);
  const pendingCount = all.filter((r: any) => r.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg">
          Reviews ({all.length}){pendingCount > 0 ? ` — ${pendingCount} awaiting moderation` : ""}
        </h2>
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

      {reviews.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing to moderate here.</p>
      ) : (
        <div className="space-y-3">
          {rows.map((r: any) => (
            <div key={r.id} className="border border-border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
                    {r.product?.name ?? "Product"} · {new Date(r.created_at).toLocaleDateString("en-GB")} ·{" "}
                    <span className="text-foreground">{r.status}</span>
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <Stars value={r.rating} />
                    <span className="text-sm">{r.title ?? "Untitled"}</span>
                  </div>
                  {r.body && (
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                      {r.body}
                    </p>
                  )}
                  <p className="mt-3 text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
                    {r.author_name ?? "Anonymous"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    disabled={r.status === "approved" || moderate.isPending}
                    onClick={() => moderate.mutate({ id: r.id, status: "approved" })}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={r.status === "rejected" || moderate.isPending}
                    onClick={() => moderate.mutate({ id: r.id, status: "rejected" })}
                  >
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={destroy.isPending}
                    onClick={() => destroy.mutate(r.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
