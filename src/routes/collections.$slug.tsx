import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/site/ProductGrid";
import { FilterBar } from "@/components/site/FilterBar";
import { getStorefront } from "@/lib/catalog.functions";
import { allColors, productColors } from "@/lib/product-colors";


const storefrontQuery = queryOptions({
  queryKey: ["storefront"],
  queryFn: () => getStorefront(),
});

const TITLES: Record<string, { title: string; description: string }> = {
  nova: {
    title: "Nova — Tier I of The Last of the First | 44 Boxing",
    description:
      "Nova is the original entry tier of the founding collection. Lightweight, low-profile speed gloves — final run before the next campaign.",
  },
  maverick: {
    title: "Maverick — Tier II of The Last of the First | 44 Boxing",
    description:
      "Maverick is the mid tier of the founding collection. Ten silhouettes built for volume training — final run before the next campaign.",
  },
  luxe: {
    title: "Luxe — Tier III of The Last of the First | 44 Boxing",
    description:
      "Luxe is the premium tier of the founding collection. Full-grain leather, hand-stitched — final run before the next campaign.",
  },
};

const TIERS: Record<string, string> = {
  nova: "Tier I — The Original Range",
  maverick: "Tier II — The Mid Range",
  luxe: "Tier III — The Premium Range",
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
  const [color, setColor] = useState<string>("All");
  const [query, setQuery] = useState("");

  const collection = data.collections.find((c) => c.slug === slug);
  if (!collection) throw notFound();

  const all = data.products.filter((p) => p.collection_id === collection.id);
  const categories = ["All", ...Array.from(new Set(all.map((p) => p.category)))];
  const colors = ["All", ...allColors(all)];
  const q = query.trim().toLowerCase();
  const products = all
    .filter((p) => category === "All" || p.category === category)
    .filter((p) => color === "All" || productColors(p).includes(color))
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
          <p className="eyebrow">The Last of the First — The Founding Collection</p>
          <h1 className="mt-4 text-[clamp(2.25rem,6vw,4.5rem)]">
            {collection.name}
            {TIERS[slug] && (
              <span className="mt-3 block text-[0.65rem] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                {TIERS[slug]}
              </span>
            )}
          </h1>
          <p className="mt-4 max-w-xl text-sm text-muted-foreground">{collection.description}</p>
        </div>
      </section>

      <section className="shell pt-12">
        <FilterBar
          searchId="collection-search"
          searchLabel={`Search ${collection.name}`}
          query={query}
          onQueryChange={setQuery}
          count={products.length}
          onClear={clearAll}
          groups={[
            { id: "type", label: "Type", options: categories, value: category, onChange: setCategory },
            { id: "colour", label: "Colour", options: colors, value: color, onChange: setColor, swatches: true },
          ]}
        />


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
                  setColor("All");
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
