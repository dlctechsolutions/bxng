import { cn } from "@/lib/utils";
import { money, num, discountPercent, effectivePrice } from "@/lib/format";

type Size = "sm" | "md" | "lg";

const badgeSize: Record<Size, string> = {
  sm: "px-2 py-1 text-[0.625rem]",
  md: "px-2 py-1 text-[0.6875rem]",
  lg: "px-2.5 py-1 text-xs",
};

const wasSize: Record<Size, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

const nowSize: Record<Size, string> = {
  sm: "text-sm font-semibold",
  md: "text-lg font-semibold",
  lg: "text-2xl font-semibold",
};

/** Blood-red sale flash. The single source of truth for discount badges. */
export function SaleBadge({
  percent,
  size = "sm",
  prefix,
  className,
}: {
  percent: number | null;
  size?: Size;
  prefix?: string;
  className?: string;
}) {
  if (percent === null) return null;
  return (
    <span
      className={cn(
        "inline-block bg-accent font-bold uppercase tracking-widest text-accent-foreground shadow-[0_0_0_1px_var(--color-blood)]",
        badgeSize[size],
        className,
      )}
    >
      {prefix ? `${prefix} ` : ""}-{percent}%
    </span>
  );
}

/** Out-of-stock flag — deliberately neutral so red stays meaningful. */
export function StockBadge({ size = "sm", className }: { size?: Size; className?: string }) {
  return (
    <span
      className={cn(
        "inline-block border border-border bg-background/80 font-bold uppercase tracking-widest text-muted-foreground",
        badgeSize[size],
        className,
      )}
    >
      Out of stock
    </span>
  );
}

/** Price pair: struck-through original in muted grey, discounted price in blood red. */
export function PriceTag({
  price,
  salePrice,
  size = "sm",
  showBadge = false,
  badgePrefix,
  className,
}: {
  price: number | string;
  salePrice?: number | string | null;
  size?: Size;
  showBadge?: boolean;
  badgePrefix?: string;
  className?: string;
}) {
  const onSale = salePrice !== null && salePrice !== undefined && salePrice !== "";
  const current = effectivePrice(price, salePrice ?? null);
  const off = discountPercent(price, salePrice ?? null);

  return (
    <p className={cn("flex flex-wrap items-baseline gap-2.5", className)}>
      {onSale && (
        <span className={cn("text-muted-foreground line-through", wasSize[size])}>
          {money(num(price))}
        </span>
      )}
      <span className={cn(nowSize[size], onSale && "text-accent")}>{money(current)}</span>
      {showBadge && <SaleBadge percent={off} size={size} prefix={badgePrefix} />}
    </p>
  );
}
