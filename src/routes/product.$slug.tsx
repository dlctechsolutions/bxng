import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Heart, Truck, Shield, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductGrid } from "@/components/site/ProductGrid";
import { getProduct } from "@/lib/catalog.functions";
import { money, num, discountPercent, effectivePrice } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/use-wishlist";
import { cn } from "@/lib/utils";

const productQuery = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: () => getProduct({ data: { slug } }),
  });

export const Route = createFileRoute("/product/$slug")({
  head: ({ params }) => {
    const name = params.slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    const title = `${name} | 44 Boxing`;
    const description = `${name} boxing gloves from 44 Boxing. Premium build, honest price, free UK delivery over £100.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  loader: ({ context, params }) => {
    context.queryClient.ensureQueryData(productQuery(params.slug));
  },
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(productQuery(slug));
  const cart = useCart();
  const wishlist = useWishlist();
  const [activeImage, setActiveImage] = useState(0);
  const [color, setColor] = useState<string | null>(null);
  const [fastening, setFastening] = useState<string | null>(null);

  const product = data?.product;
  const variants = useMemo(() => product?.product_variants ?? [], [product]);
  const colors = useMemo(
    () => Array.from(new Set(variants.map((v) => v.color))),
    [variants],
  );
  const fastenings = useMemo(
    () => Array.from(new Set(variants.map((v) => v.fastening))),
    [variants],
  );

  if (!product) {
    return (
      <div className="shell py-32 text-center">
        <h1 className="text-3xl">Product not found</h1>
        <Button asChild className="mt-8">
          <Link to="/">Back home</Link>
        </Button>
      </div>
    );
  }

  const price = effectivePrice(product.price, product.sale_price);
  const off = discountPercent(product.price, product.sale_price);
  const images = product.images?.length ? product.images : ["/images/prod-luxe-onyx.jpg"];
  const selected = variants.find((v) => v.color === color && v.fastening === fastening) ?? null;
  const stockFor = (c: string, f: string) =>
    variants.find((v) => v.color === c && v.fastening === f)?.stock ?? 0;
  const needsVariant = product.has_variants;
  const canAdd =
    product.in_stock && (!needsVariant || (selected !== null && selected.stock > 0));

  function addToCart() {
    if (!canAdd) return;
    cart.add({
      productId: product!.id,
      variantId: selected?.id ?? null,
      slug: product!.slug,
      name: product!.name,
      variantLabel: selected ? `${selected.color} · ${selected.fastening}` : null,
      image: images[0],
      unitPrice: price,
    });
  }

  return (
    <>
      <div className="shell pt-8">
        <nav className="text-xs text-muted-foreground">
          <Link to="/" className="link-underline">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link
            to="/collections/$slug"
            params={{ slug: product.collection?.slug ?? "luxe" }}
            className="link-underline"
          >
            {product.collection?.name}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>
      </div>

      <section className="shell grid gap-12 pt-8 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-4">
          <div className="relative bg-surface">
            <img
              src={images[activeImage]}
              alt={product.name}
              width={1024}
              height={1024}
              className="aspect-square w-full object-cover"
            />
            {off !== null && (
              <span className="absolute left-4 top-4 bg-accent px-2.5 py-1 text-[0.625rem] font-bold uppercase tracking-widest text-accent-foreground">
                -{off}%
              </span>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-3">
              {images.map((img, i) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  aria-label={`View image ${i + 1}`}
                  className={cn(
                    "size-20 overflow-hidden border transition-colors",
                    i === activeImage ? "border-foreground" : "border-border",
                  )}
                >
                  <img src={img} alt="" loading="lazy" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-7">
          <div>
            <p className="eyebrow">{product.category}</p>
            <h1 className="mt-3 text-[clamp(2rem,4.5vw,3.25rem)]">{product.name}</h1>
          </div>

          <p className="flex items-baseline gap-3">
            {product.sale_price && (
              <span className="text-lg text-muted-foreground line-through">
                {money(num(product.price))}
              </span>
            )}
            <span className="text-2xl font-semibold">{money(price)}</span>
          </p>

          <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          {needsVariant && (
            <div className="space-y-6">
              <div>
                <p className="eyebrow">Colour {color ? `— ${color}` : ""}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={cn(
                        "border px-4 py-2 text-[0.65rem] font-bold uppercase tracking-[0.18em] transition-colors",
                        color === c
                          ? "border-foreground bg-foreground text-background"
                          : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="eyebrow">Fastening {fastening ? `— ${fastening}` : ""}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {fastenings.map((f) => {
                    const unavailable = color !== null && stockFor(color, f) === 0;
                    return (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFastening(f)}
                        disabled={unavailable}
                        className={cn(
                          "border px-4 py-2 text-[0.65rem] font-bold uppercase tracking-[0.18em] transition-colors",
                          fastening === f
                            ? "border-foreground bg-foreground text-background"
                            : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
                          unavailable && "cursor-not-allowed line-through opacity-40 hover:border-border",
                        )}
                      >
                        {f}
                      </button>
                    );
                  })}
                </div>
              </div>
              {selected && (
                <p className="text-xs text-muted-foreground">
                  {selected.stock > 0
                    ? `${selected.stock} in stock`
                    : "This combination is out of stock"}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="flex-1" disabled={!canAdd} onClick={addToCart}>
              {!product.in_stock
                ? "Out of stock"
                : needsVariant && !selected
                  ? "Select options"
                  : canAdd
                    ? "Add to cart"
                    : "Out of stock"}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => wishlist.toggle(product.id)}
              className="gap-2"
            >
              <Heart className={cn("size-4", wishlist.has(product.id) && "fill-accent text-accent")} />
              {wishlist.has(product.id) ? "Saved" : "Wishlist"}
            </Button>
          </div>

          <ul className="grid gap-3 border-y border-border py-6 text-xs text-muted-foreground sm:grid-cols-3">
            <li className="flex items-center gap-2">
              <Truck className="size-4" /> Free UK delivery over £100
            </li>
            <li className="flex items-center gap-2">
              <Repeat className="size-4" /> 30-day returns
            </li>
            <li className="flex items-center gap-2">
              <Shield className="size-4" /> 2-year stitch warranty
            </li>
          </ul>

          <Tabs defaultValue="description">
            <TabsList className="w-full justify-start gap-6 border-b border-border bg-transparent p-0">
              <TabsTrigger value="description" className="px-0 pb-3 text-[0.65rem] font-bold uppercase tracking-[0.2em]">
                Description
              </TabsTrigger>
              <TabsTrigger value="details" className="px-0 pb-3 text-[0.65rem] font-bold uppercase tracking-[0.2em]">
                Specification
              </TabsTrigger>
              <TabsTrigger value="shipping" className="px-0 pb-3 text-[0.65rem] font-bold uppercase tracking-[0.2em]">
                Shipping
              </TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="pt-5 text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </TabsContent>
            <TabsContent value="details" className="pt-5 text-sm leading-relaxed text-muted-foreground">
              {product.details}
            </TabsContent>
            <TabsContent value="shipping" className="pt-5 text-sm leading-relaxed text-muted-foreground">
              Dispatched within 24 hours on working days. Free UK delivery over £100, £4.95
              otherwise. International shipping calculated at checkout. Unused items can be
              returned within 30 days.
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {data.related.length > 0 && (
        <section className="shell pt-28">
          <h2 className="border-b border-border pb-6 text-[clamp(1.5rem,3vw,2.25rem)]">
            You might also like
          </h2>
          <div className="mt-12">
            <ProductGrid products={data.related} />
          </div>
        </section>
      )}
    </>
  );
}
