import { useState } from "react";
import { Search, X, SlidersHorizontal, ChevronDown } from "lucide-react";
import { COLOR_SWATCHES } from "@/lib/product-colors";


export type FilterGroup = {
  id: string;
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  /** render options as colour swatches */
  swatches?: boolean;
};

type Props = {
  groups: FilterGroup[];
  query: string;
  onQueryChange: (value: string) => void;
  searchId: string;
  searchLabel: string;
  count: number;
  onClear: () => void;
};

function Pill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        "focus-flash h-9 border px-4 text-[0.65rem] font-bold uppercase tracking-[0.18em] transition-colors " +
        (active
          ? "border-foreground bg-foreground text-background"
          : "border-border/70 bg-card text-muted-foreground hover:border-foreground/60 hover:text-foreground")
      }
    >
      {label}
    </button>
  );
}

function Swatch({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={
        "focus-flash grid size-9 place-items-center border transition-colors " +
        (active
          ? "border-foreground"
          : "border-border/70 hover:border-foreground/60")
      }
    >
      <span
        aria-hidden
        className="size-4 rounded-full border border-border/60"
        style={{ backgroundColor: COLOR_SWATCHES[label] ?? "transparent" }}
      />
    </button>
  );
}

export function FilterBar({
  groups,
  query,
  onQueryChange,
  searchId,
  searchLabel,
  count,
  onClear,
}: Props) {
  const active = groups.filter((g) => g.value !== "All");
  const hasFilters = active.length > 0 || query.trim().length > 0;

  return (
    <div className="border border-border/70 bg-card/40">
      {/* top row: search + count */}
      <div className="flex flex-col gap-4 border-b border-border/70 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <label htmlFor={searchId} className="sr-only">
            {searchLabel}
          </label>
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search products"
            className="focus-flash h-10 w-full border border-border/70 bg-background pl-10 pr-10 text-xs uppercase tracking-[0.16em] text-foreground placeholder:text-muted-foreground hover:border-foreground/40"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              aria-label="Clear search"
              className="icon-action absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls={`${searchId}-filters`}
            className={
              "focus-flash flex h-10 items-center gap-2 border px-4 text-[0.65rem] font-bold uppercase tracking-[0.18em] transition-colors " +
              (open || active.length
                ? "border-foreground bg-foreground text-background"
                : "border-border/70 bg-background text-muted-foreground hover:border-foreground/60 hover:text-foreground")
            }
          >
            <SlidersHorizontal aria-hidden className="size-3.5" />
            Filter
            {active.length > 0 && <span>({active.length})</span>}
            <ChevronDown
              aria-hidden
              className={"size-3.5 transition-transform " + (open ? "rotate-180" : "")}
            />
          </button>

          <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            {count} product{count === 1 ? "" : "s"}
          </p>
          {hasFilters && (
            <button
              type="button"
              onClick={onClear}
              className="focus-flash text-[0.65rem] font-bold uppercase tracking-[0.18em] text-accent underline-offset-4 hover:underline"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* filter rows */}
      {open && (
        <div id={`${searchId}-filters`} className="divide-y divide-border/50">
          {groups.map((group) => (
            <div
              key={group.id}
              className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:gap-6"
            >
              <span className="shrink-0 text-[0.6rem] font-bold uppercase tracking-[0.22em] text-muted-foreground sm:w-20">
                {group.label}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {group.swatches
                  ? group.options.map((o) =>
                      o === "All" ? (
                        <Pill
                          key={o}
                          label="All"
                          active={group.value === o}
                          onClick={() => group.onChange(o)}
                        />
                      ) : (
                        <Swatch
                          key={o}
                          label={o}
                          active={group.value === o}
                          onClick={() => group.onChange(o)}
                        />
                      ),
                    )
                  : group.options.map((o) => (
                      <Pill
                        key={o}
                        label={o}
                        active={group.value === o}
                        onClick={() => group.onChange(o)}
                      />
                    ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

