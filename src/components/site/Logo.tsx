import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Logo({ className, small }: { className?: string; small?: boolean }) {
  return (
    <Link to="/" className={cn("group inline-flex items-baseline gap-2", className)}>
      <span
        className={cn(
          "font-display font-extrabold uppercase leading-none tracking-tighter",
          small ? "text-xl" : "text-2xl",
        )}
      >
        44
      </span>
      <span
        className={cn(
          "font-display uppercase leading-none tracking-[0.4em] text-muted-foreground transition-colors group-hover:text-foreground",
          small ? "text-[0.6rem]" : "text-[0.7rem]",
        )}
      >
        Boxing
      </span>
    </Link>
  );
}
