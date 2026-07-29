import { Link } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { effectivePrice } from "@/lib/format";
import { PriceTag } from "./Price";
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
            <PriceTag
              price={product.price}
              salePrice={product.sale_price}
              size="md"
              showBadge
            />
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
