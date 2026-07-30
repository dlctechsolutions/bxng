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
        "focus-flash h-9 shrink-0 whitespace-nowrap border px-4 text-[0.65rem] font-bold uppercase tracking-[0.18em] transition-colors " +
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
        "focus-flash grid size-9 shrink-0 place-items-center border transition-colors " +
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
  const [open, setOpen] = useState(false);
  const active = groups.filter((g) => g.value !== "All");
  const hasFilters = active.length > 0 || query.trim().length > 0;


  return (
    <div className="border border-border/70 bg-card/40">
      {/* top: search + filter toggle */}
      <div className="border-b border-border/70 p-3 sm:p-4">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:flex sm:justify-between sm:gap-4">
          <div className="relative min-w-0 sm:w-full sm:max-w-sm">
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
              placeholder="Search"
              className="focus-flash h-11 w-full border border-border/70 bg-background pl-9 pr-9 text-xs uppercase tracking-[0.14em] text-foreground placeholder:text-muted-foreground hover:border-foreground/40 sm:h-10 sm:pl-10 sm:pr-10"
            />
            {query && (
              <button
                type="button"
                onClick={() => onQueryChange("")}
                aria-label="Clear search"
                className="icon-action absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls={`${searchId}-filters`}
              className={
                "focus-flash flex h-11 items-center gap-2 border px-3 text-[0.65rem] font-bold uppercase tracking-[0.18em] transition-colors sm:h-10 sm:px-4 " +
                (open || active.length
                  ? "border-foreground bg-foreground text-background"
                  : "border-border/70 bg-background text-muted-foreground hover:border-foreground/60 hover:text-foreground")
              }
            >
              <SlidersHorizontal aria-hidden className="size-3.5 shrink-0" />
              <span className="hidden sm:inline">Filter</span>
              {active.length > 0 && <span>{active.length}</span>}
              <ChevronDown
                aria-hidden
                className={"size-3.5 shrink-0 transition-transform " + (open ? "rotate-180" : "")}
              />
            </button>

            <p className="hidden text-[0.65rem] font-bold uppercase tracking-[0.18em] text-muted-foreground sm:block">
              {count} product{count === 1 ? "" : "s"}
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={onClear}
                className="focus-flash hidden text-[0.65rem] font-bold uppercase tracking-[0.18em] text-accent underline-offset-4 hover:underline sm:block"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* mobile meta row */}
        <div className="mt-2 flex items-center justify-between sm:hidden">
          <p className="text-[0.6rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            {count} product{count === 1 ? "" : "s"}
          </p>
          {hasFilters && (
            <button
              type="button"
              onClick={onClear}
              className="focus-flash text-[0.6rem] font-bold uppercase tracking-[0.18em] text-accent underline-offset-4"
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
              className="flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:gap-6 sm:px-4"
            >
              <span className="shrink-0 text-[0.6rem] font-bold uppercase tracking-[0.22em] text-muted-foreground sm:w-20">
                {group.label}
              </span>
              <div className="-mx-3 flex snap-x items-center gap-2 overflow-x-auto px-3 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
                {group.options.map((o) =>
                  group.swatches && o !== "All" ? (
                    <Swatch
                      key={o}
                      label={o}
                      active={group.value === o}
                      onClick={() => group.onChange(o)}
                    />
                  ) : (
                    <Pill
                      key={o}
                      label={o}
                      active={group.value === o}
                      onClick={() => group.onChange(o)}
                    />
                  ),
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


