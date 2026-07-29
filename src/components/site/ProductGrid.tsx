import { useState } from "react";
import { ProductCard } from "./ProductCard";
import { QuickView } from "./QuickView";
import type { Product } from "@/lib/catalog.functions";

export function ProductGrid({ products, columns = 3 }: { products: Product[]; columns?: 3 | 4 }) {
  const [quick, setQuick] = useState<Product | null>(null);
  return (
    <>
      <div
        className={
          columns === 4
            ? "grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 lg:grid-cols-4"
            : "grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3"
        }
      >
        {products.map((p) => (
          <ProductCard key={p.id} product={p} onQuickView={setQuick} />
        ))}
      </div>
      <QuickView product={quick} onOpenChange={(open: boolean) => !open && setQuick(null)} />
    </>
  );
}
