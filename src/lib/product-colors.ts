export const COLOR_SWATCHES: Record<string, string> = {
  Black: "#0a0a0a",
  White: "#f5f5f0",
  Grey: "#8a8a8a",
  Red: "#b0201f",
  Green: "#1f5c3a",
  Blue: "#2b5fa8",
  Gold: "#b8912f",
  Beige: "#e0d3ba",
  Brown: "#6b4a2f",
};

type VariantLike = { color?: string | null };
type ProductLike = { product_variants?: VariantLike[] | null };

/** Colour tags for a product, parsed from its variants' comma-separated colour lists. */
export function productColors(product: ProductLike): string[] {
  const set = new Set<string>();
  for (const variant of product.product_variants ?? []) {
    for (const part of (variant.color ?? "").split(",")) {
      const name = part.trim();
      if (name) set.add(name);
    }
  }
  return Array.from(set).sort();
}

export function allColors(products: ProductLike[]): string[] {
  const set = new Set<string>();
  for (const p of products) productColors(p).forEach((c) => set.add(c));
  return Array.from(set).sort();
}
