import { createFileRoute } from "@tanstack/react-router";
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

const TITLE = "All Boxing Gloves — The Last of the First | 44 Boxing";
const DESCRIPTION =
  "Every pair from the founding collection in one place — Nova, Maverick and Luxe. Filter by range and category before the final run sells out.";

export const Route = createFileRoute("/collections/all")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(storefrontQuery);
  },
  component: AllGlovesPage,
});

function AllGlovesPage() {
  const { data } = useSuspenseQuery(storefrontQuery);
  const [range, setRange] = useState("All");
  const [category, setCategory] = useState("All");
  const [color, setColor] = useState("All");
  const [query, setQuery] = useState("");

  const ranges = ["All", ...data.collections.map((c) => c.name)];
  const categories = [
    "All",
    ...Array.from(new Set(data.products.map((p) => p.category))),
  ];
  const colors = ["All", ...allColors(data.products)];

  const q = query.trim().toLowerCase();
  const products = data.products
    .filter((p) => range === "All" || p.collection?.name === range)
    .filter((p) => category === "All" || p.category === category)
    .filter((p) => color === "All" || productColors(p).includes(color))
    .filter(
      (p) =>
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.collection?.name ?? "").toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q),
    );

  const clearAll = () => {
    setQuery("");
    setCategory("All");
    setRange("All");
    setColor("All");
  };

  return (
    <>
      <section className="relative isolate overflow-hidden">
        <img
          src="/images/hero.jpg"
          alt="44BXNG athlete overlooking the city skyline"
          width={1600}
          height={900}
          className="h-[22rem] w-full object-cover object-[center_25%] md:h-[28rem]"
        />
        <div className="pointer-events-none absolute inset-0 bg-background/30" />
        <div className="pointer-events-none absolute inset-0 editorial-overlay" />
        <div className="pointer-events-none absolute inset-0 vignette" />
        <div className="shell absolute inset-0 flex flex-col justify-end pb-12">
          <p className="eyebrow">The Last of the First — The Founding Collection</p>
          <h1 className="mt-4 text-[clamp(2.25rem,6vw,4.5rem)]">All Boxing Gloves</h1>
          <p className="mt-4 max-w-xl text-sm text-muted-foreground">
            Every pair from the founding run — Nova, Maverick and Luxe in one place.
          </p>
        </div>
      </section>

      <section className="shell pt-12">
        <FilterBar
          searchId="all-search"
          searchLabel="Search all gloves"
          query={query}
          onQueryChange={setQuery}
          count={products.length}
          onClear={clearAll}
          groups={[
            { id: "range", label: "Range", options: ranges, value: range, onChange: setRange },
            { id: "type", label: "Type", options: categories, value: category, onChange: setCategory },
            { id: "colour", label: "Colour", options: colors, value: color, onChange: setColor, swatches: true },
          ]}
        />


        <div className="mt-8">
          {products.length === 0 ? (
            <div className="border border-border bg-card px-6 py-20 text-center">
              <p className="text-sm text-muted-foreground">No products match your filters.</p>
              <Button
                variant="outline"
                className="mt-6"
                onClick={() => {
                  setQuery("");
                  setCategory("All");
                  setRange("All");
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
