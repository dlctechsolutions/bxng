import { Link } from "@tanstack/react-router";
import { Heart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { discountPercent, effectivePrice } from "@/lib/format";
import { PriceTag, SaleBadge, StockBadge } from "./Price";
import { Stars } from "./ProductReviews";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/use-wishlist";
import { useRating } from "@/lib/use-rating";
import type { Product } from "@/lib/catalog.functions";

export function ProductCard({
  product,
  onQuickView,
}: {
  product: Product;
  onQuickView: (product: Product) => void;
}) {
  const cart = useCart();
  const wishlist = useWishlist();
  const off = discountPercent(product.price, product.sale_price);
  const price = effectivePrice(product.price, product.sale_price);
  const image = product.images?.[0] ?? "/images/prod-luxe-onyx.jpg";
  const soldOut = !product.in_stock;
  const saved = wishlist.has(product.id);
  const rating = useRating(product.id);

  return (
    <article className="group relative flex flex-col">
      <div className="relative overflow-hidden bg-surface">
        <Link
          to="/product/$slug"
          params={{ slug: product.slug }}
          aria-label={product.name}
          className="block"
        >
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            width={1024}
            height={1024}
            className={cn(
              "aspect-square w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]",
              soldOut && "opacity-45",
            )}
          />
        </Link>

        <div className="pointer-events-none absolute inset-0 vignette-soft opacity-70 transition-opacity duration-700 group-hover:opacity-40" />

        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <div className="flex flex-col items-start gap-1">
            <SaleBadge percent={off} prefix="Up to" />
            {soldOut && <StockBadge />}
          </div>

          <button
            type="button"
            onClick={() => wishlist.toggle(product.id)}
            aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={saved}
            className="pointer-events-auto grid size-9 place-items-center border border-border bg-background/70 backdrop-blur transition-colors hover:border-accent hover:text-accent focus-flash"
          >
            <Heart className={cn("size-4", saved && "fill-accent text-accent")} />
          </button>
        </div>

        <div className="absolute inset-x-0 bottom-0 translate-y-full p-3 transition-transform duration-300 ease-out group-hover:translate-y-0">
          <button
            type="button"
            onClick={() => onQuickView(product)}
            className="flex w-full items-center justify-center gap-2 border border-border bg-background/85 py-2 text-[0.625rem] font-bold uppercase tracking-[0.2em] backdrop-blur transition-colors hover:border-accent hover:bg-foreground hover:text-background focus-flash"
          >
            <Eye className="size-3.5" /> Quick view
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 pt-4">
        <div className="min-w-0">
          <p className="eyebrow">{product.category}</p>
          <h3 className="mt-1 truncate text-base tracking-tight">
            <Link to="/product/$slug" params={{ slug: product.slug }} className="link-underline">
              {product.name}
            </Link>
          </h3>
        </div>
        {rating && rating.count > 0 && (
          <Link
            to="/product/$slug"
            params={{ slug: product.slug }}
            className="inline-flex items-center gap-2 text-[0.7rem] text-muted-foreground transition-colors hover:text-foreground"
          >
            <Stars value={rating.average} />
            <span>
              {rating.average.toFixed(1)} ({rating.count})
            </span>
          </Link>
        )}
        <PriceTag price={product.price} salePrice={product.sale_price} size="sm" />
        <div className="mt-auto">
          {soldOut ? (
            <Button variant="outline" className="w-full" disabled>
              Out of stock
            </Button>
          ) : product.has_variants ? (
            <Button asChild variant="outline" className="w-full">
              <Link to="/product/$slug" params={{ slug: product.slug }}>
                Select options
              </Link>
            </Button>
          ) : (
            <Button
              className="w-full"
              onClick={() =>
                cart.add({
                  productId: product.id,
                  variantId: null,
                  slug: product.slug,
                  name: product.name,
                  variantLabel: null,
                  image,
                  unitPrice: price,
                })
              }
            >
              Add to cart
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
