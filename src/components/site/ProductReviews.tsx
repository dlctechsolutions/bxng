import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/use-auth";
import {
  deleteMyReview,
  getMyReview,
  getProductReviews,
  submitReview,
} from "@/lib/reviews.functions";
import { cn } from "@/lib/utils";

export function Stars({
  value,
  size = "sm",
  className,
}: {
  value: number;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            size === "md" ? "size-5" : "size-3.5",
            i <= Math.round(value)
              ? "fill-accent text-accent"
              : "text-muted-foreground/40",
          )}
        />
      ))}
    </span>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          aria-label={`${i} star${i === 1 ? "" : "s"}`}
          aria-pressed={value === i}
          className="focus-flash p-1"
        >
          <Star
            className={cn(
              "size-6 transition-colors",
              i <= value ? "fill-accent text-accent" : "text-muted-foreground/40 hover:text-foreground",
            )}
          />
        </button>
      ))}
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ProductReviews({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const fetchReviews = useServerFn(getProductReviews);
  const fetchMine = useServerFn(getMyReview);
  const save = useServerFn(submitReview);
  const remove = useServerFn(deleteMyReview);

  const reviews = useQuery({
    queryKey: ["reviews", productId],
    queryFn: () => fetchReviews({ data: { productId } }),
  });

  const mine = useQuery({
    queryKey: ["reviews", productId, "mine", user?.id],
    enabled: !!user,
    queryFn: () => fetchMine({ data: { productId } }),
  });

  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    if (mine.data) {
      setRating(mine.data.rating);
      setTitle(mine.data.title ?? "");
      setBody(mine.data.body ?? "");
    }
  }, [mine.data]);

  const submit = useMutation({
    mutationFn: () =>
      save({
        data: {
          productId,
          rating,
          title,
          body,
          authorName:
            (user?.user_metadata as any)?.full_name ??
            user?.email?.split("@")[0] ??
            "Verified customer",
        },
      }),
    onSuccess: () => {
      toast.success("Thanks — your review is awaiting moderation.");
      qc.invalidateQueries({ queryKey: ["reviews", productId] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not save your review."),
  });

  const destroy = useMutation({
    mutationFn: () => remove({ data: { productId } }),
    onSuccess: () => {
      setRating(0);
      setTitle("");
      setBody("");
      toast.success("Review deleted.");
      qc.invalidateQueries({ queryKey: ["reviews", productId] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not delete your review."),
  });

  const list = reviews.data?.reviews ?? [];
  const count = reviews.data?.count ?? 0;
  const average = reviews.data?.average ?? 0;

  return (
    <section id="reviews" className="shell pt-28">
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-border pb-6">
        <div>
          <p className="eyebrow">Reviews</p>
          <h2 className="mt-3 text-[clamp(1.5rem,3vw,2.25rem)]">What fighters say</h2>
        </div>
        <div className="flex items-center gap-3">
          <Stars value={average} size="md" />
          <span className="text-sm text-muted-foreground">
            {count > 0 ? `${average.toFixed(1)} / 5 — ${count} review${count === 1 ? "" : "s"}` : "No reviews yet"}
          </span>
        </div>
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          {reviews.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading reviews…</p>
          ) : list.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No published reviews for {productName} yet. Be the first to write one.
            </p>
          ) : (
            list.map((r) => (
              <article key={r.id} className="border border-border bg-card p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Stars value={r.rating} />
                  <span className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
                    {formatDate(r.created_at)}
                  </span>
                </div>
                {r.title && <h3 className="mt-4 text-base">{r.title}</h3>}
                {r.body && (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
                )}
                <p className="mt-4 text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
                  {r.author_name ?? "Verified customer"}
                </p>
              </article>
            ))
          )}
        </div>

        <div className="border border-border bg-card p-6">
          <h3 className="text-[0.7rem] font-bold uppercase tracking-[0.2em]">
            {mine.data ? "Your review" : "Write a review"}
          </h3>

          {!user ? (
            <>
              <p className="mt-4 text-sm text-muted-foreground">
                Sign in to rate and review this product.
              </p>
              <Button asChild className="mt-6 w-full">
                <Link to="/auth">Sign in</Link>
              </Button>
            </>
          ) : (
            <form
              className="mt-5 space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                if (rating < 1) {
                  toast.error("Pick a star rating first.");
                  return;
                }
                submit.mutate();
              }}
            >
              {mine.data && (
                <p className="text-xs text-muted-foreground">
                  Status:{" "}
                  <span className="uppercase tracking-[0.18em] text-foreground">
                    {mine.data.status}
                  </span>
                  {mine.data.status === "pending" && " — awaiting moderation"}
                </p>
              )}
              <div>
                <p className="eyebrow">Rating</p>
                <div className="mt-2">
                  <StarPicker value={rating} onChange={setRating} />
                </div>
              </div>
              <div>
                <label className="eyebrow" htmlFor="review-title">
                  Title
                </label>
                <Input
                  id="review-title"
                  value={title}
                  maxLength={120}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Sharp, protective, built to last"
                  className="mt-2"
                />
              </div>
              <div>
                <label className="eyebrow" htmlFor="review-body">
                  Review
                </label>
                <Textarea
                  id="review-body"
                  value={body}
                  maxLength={2000}
                  rows={5}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="How do they feel on the bag, on pads, in sparring?"
                  className="mt-2"
                />
              </div>
              <Button type="submit" className="w-full" disabled={submit.isPending}>
                {submit.isPending ? "Saving…" : mine.data ? "Update review" : "Submit review"}
              </Button>
              {mine.data && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2"
                  disabled={destroy.isPending}
                  onClick={() => destroy.mutate()}
                >
                  <Trash2 className="size-4" /> Delete review
                </Button>
              )}
              <p className="text-[0.65rem] leading-relaxed text-muted-foreground">
                Reviews are checked by our team before they appear on the site.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
