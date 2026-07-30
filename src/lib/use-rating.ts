import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getRatingSummaries, type RatingSummary } from "@/lib/ratings.functions";

/** Shared (deduped) rating summaries for all products. */
export function useRating(productId: string): RatingSummary | null {
  const fetchSummaries = useServerFn(getRatingSummaries);
  const { data } = useQuery({
    queryKey: ["rating-summaries"],
    queryFn: () => fetchSummaries(),
    staleTime: 5 * 60_000,
  });
  return data?.[productId] ?? null;
}
