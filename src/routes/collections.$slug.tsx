import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useState } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/site/ProductGrid";
import { getStorefront } from "@/lib/catalog.functions";

const storefrontQuery = queryOptions({
  queryKey: ["storefront"],
  queryFn: () => getStorefront(),
});

const TITLES: Record<string, { title: string; description: string }> = {
  luxe: {
    title: "Luxe Collection — Hand-Stitched Leather Gloves | 44 Boxing",
    description:
      "Full-grain leather, triple-density foam, hand-stitched. The founding 44 Boxing collection.",
  },
  maverick: {
    title: "Maverick Collection — Everyday Training Gloves | 44 Boxing",
    description:
      "Ten Maverick silhouettes built for volume training. Durable, responsive and sharply priced.",
  },
  nova: {
    title: "Nova Collection — Lightweight Speed Gloves | 44 Boxing",
    description:
      "Low-profile Nova gloves with anatomical grip bar and dual-density foam. Made for speed.",
  },
};

export const Route = createFileRoute("/collections/$slug")({
  head: ({ params }) => {
    const meta = TITLES[params.slug] ?? {
      title: "Boxing Gloves | 44 Boxing",
      description: "Premium boxing gloves from 44 Boxing.",
    };
    return {
      meta: [
        { title: meta.title },
        { name: "description", content: meta.description },
        { property: "og:title", content: meta.title },
        { property: "og:description", content: meta.description },
      ],
    };
  },
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(storefrontQuery);
  },
  component: CollectionPage,
  notFoundComponent: () => (
    <div className="shell py-32 text-center">
      <h1 className="text-3xl">Collection not found</h1>
      <Button asChild className="mt-8">
        <Link to="/">Back home</Link>
      </Button>
    </div>
  ),
});

function CollectionPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(storefrontQuery);
  const [category, setCategory] = useState<string>("All");
  const [query, setQuery] = useState("");

  const collection = data.collections.find((c) => c.slug === slug);
  if (!collection) throw notFound();

  const all = data.products.filter((p) => p.collection_id === collection.id);
  const categories = ["All", ...Array.from(new Set(all.map((p) => p.category)))];
  const q = query.trim().toLowerCase();
  const products = all
    .filter((p) => category === "All" || p.category === category)
    .filter(
      (p) =>
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q),
    );

  return (
    <>
      <section className="relative isolate overflow-hidden">
        <img
          src={collection.banner_image ?? "/images/banner-luxe.jpg"}
          alt={collection.name}
          width={1600}
          height={900}
          className="h-[22rem] w-full object-cover md:h-[28rem]"
        />
        <div className="pointer-events-none absolute inset-0 bg-background/30" />
        <div className="pointer-events-none absolute inset-0 editorial-overlay" />
        <div className="pointer-events-none absolute inset-0 vignette" />
        <div className="shell absolute inset-0 flex flex-col justify-end pb-12">
          <p className="eyebrow">{collection.tagline}</p>
          <h1 className="mt-4 text-[clamp(2.25rem,6vw,4.5rem)]">{collection.name}</h1>
          <p className="mt-4 max-w-xl text-sm text-muted-foreground">{collection.description}</p>
        </div>
      </section>

      <section className="shell pt-12">
        <div className="flex flex-col gap-6 border-b border-border pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="eyebrow mr-3">Filter</span>
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                aria-pressed={category === c}
                className={
                  "border px-4 py-2 text-[0.65rem] font-bold uppercase tracking-[0.18em] transition-colors focus-flash " +
                  (category === c
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:border-foreground hover:text-foreground")
                }
              >
                {c}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:max-w-xs">
            <Search
              aria-hidden
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <label htmlFor="collection-search" className="sr-only">
              Search {collection.name}
            </label>
            <input
              id="collection-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products"
              className="focus-flash w-full border border-border bg-card py-2.5 pl-10 pr-10 text-xs uppercase tracking-[0.16em] text-foreground placeholder:text-muted-foreground hover:border-foreground/40"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="icon-action absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          {products.length} product{products.length === 1 ? "" : "s"}
          {q ? ` matching "${query.trim()}"` : ""}
        </p>

        <div className="mt-8">
          {products.length === 0 ? (
            <div className="border border-border bg-card px-6 py-20 text-center">
              <p className="text-sm text-muted-foreground">
                No products match your search.
              </p>
              <Button
                variant="outline"
                className="mt-6"
                onClick={() => {
                  setQuery("");
                  setCategory("All");
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <ProductGrid products={products} columns={4} />
          )}
        </div>
      </section>
    </>
  );
}
