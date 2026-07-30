import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useState } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/site/ProductGrid";
import { getStorefront } from "@/lib/catalog.functions";
import { allColors, productColors, COLOR_SWATCHES } from "@/lib/product-colors";

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

  const filterButton = (
    label: string,
    active: boolean,
    onClick: () => void,
    swatch?: string,
  ) => (
    <button
      key={label}
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        "flex items-center gap-2 border px-4 py-2 text-[0.65rem] font-bold uppercase tracking-[0.18em] transition-colors focus-flash " +
        (active
          ? "border-foreground bg-foreground text-background"
          : "border-border text-muted-foreground hover:border-foreground hover:text-foreground")
      }
    >
      {swatch && (
        <span
          aria-hidden
          className="size-3 rounded-full border border-border/60"
          style={{ backgroundColor: swatch }}
        />
      )}
      {label}
    </button>
  );


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
        <div className="flex flex-col gap-6 border-b border-border pb-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="eyebrow mr-3">Range</span>
                {ranges.map((r) =>
                  filterButton(r, range === r, () => setRange(r)),
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="eyebrow mr-3">Type</span>
                {categories.map((c) =>
                  filterButton(c, category === c, () => setCategory(c)),
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="eyebrow mr-3">Colour</span>
                {colors.map((c) =>
                  filterButton(
                    c,
                    color === c,
                    () => setColor(c),
                    c === "All" ? undefined : COLOR_SWATCHES[c],
                  ),
                )}
              </div>
            </div>


            <div className="relative w-full lg:max-w-xs">
              <Search
                aria-hidden
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <label htmlFor="all-search" className="sr-only">
                Search all gloves
              </label>
              <input
                id="all-search"
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
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          {products.length} product{products.length === 1 ? "" : "s"}
          {q ? ` matching "${query.trim()}"` : ""}
        </p>

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
