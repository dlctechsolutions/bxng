export function money(value: number | string | null | undefined): string {
  const n = typeof value === "string" ? parseFloat(value) : (value ?? 0);
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
  }).format(Number.isFinite(n) ? n : 0);
}

export function num(value: number | string | null | undefined): number {
  if (value === null || value === undefined) return 0;
  const n = typeof value === "string" ? parseFloat(value) : value;
  return Number.isFinite(n) ? n : 0;
}

export function discountPercent(price: number | string, salePrice?: number | string | null) {
  const p = num(price);
  const s = num(salePrice);
  if (!salePrice || s <= 0 || s >= p) return null;
  return Math.round(((p - s) / p) * 100);
}

export function effectivePrice(price: number | string, salePrice?: number | string | null) {
  const s = num(salePrice);
  return s > 0 ? s : num(price);
}
