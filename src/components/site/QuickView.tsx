import { Link } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { money, discountPercent, effectivePrice, num } from "@/lib/format";
import { useCart } from "@/lib/cart";
import type { Product } from "@/lib/catalog.functions";

export function QuickView({
  product,
  onOpenChange,
}: {
  product: Product | null;
  onOpenChange: (open: boolean) => void;
}) {
  const cart = useCart();
  if (!product) return null;
  const off = discountPercent(product.price, product.sale_price);
  const price = effectivePrice(product.price, product.sale_price);
  const image = product.images?.[0] ?? "/images/prod-luxe-onyx.jpg";

  return (
    <Dialog open={!!product} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl border-border bg-card p-0">
        <div className="grid gap-0 md:grid-cols-2">
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            width={1024}
            height={1024}
            className="aspect-square w-full object-cover"
          />
          <div className="flex flex-col gap-5 p-6 md:p-8">
            <div>
              <p className="eyebrow">{product.category}</p>
              <DialogTitle className="mt-2 text-2xl">{product.name}</DialogTitle>
            </div>
            <p className="flex items-baseline gap-3">
              {product.sale_price && (
                <span className="text-muted-foreground line-through">
                  {money(num(product.price))}
                </span>
              )}
              <span className="text-xl font-semibold">{money(price)}</span>
              {off !== null && (
                <span className="bg-accent px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-widest text-accent-foreground">
                  -{off}%
                </span>
              )}
            </p>
            <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </DialogDescription>
            <div className="mt-auto flex flex-col gap-3">
              {!product.in_stock ? (
                <Button disabled variant="outline">
                  Out of stock
                </Button>
              ) : product.has_variants ? (
                <Button asChild>
                  <Link to="/product/$slug" params={{ slug: product.slug }}>
                    Select options
                  </Link>
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    cart.add({
                      productId: product.id,
                      variantId: null,
                      slug: product.slug,
                      name: product.name,
                      variantLabel: null,
                      image,
                      unitPrice: price,
                    });
                    onOpenChange(false);
                  }}
                >
                  Add to cart
                </Button>
              )}
              <Button asChild variant="ghost">
                <Link to="/product/$slug" params={{ slug: product.slug }}>
                  View full details
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
