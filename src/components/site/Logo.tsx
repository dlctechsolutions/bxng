import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import logoAsset from "@/assets/44bxng-logo.png.asset.json";

export function Logo({ className, small }: { className?: string; small?: boolean }) {
  return (
    <Link
      to="/"
      aria-label="44BXNG home"
      className={cn("group inline-flex items-center", className)}
    >
      <img
        src={logoAsset.url}
        alt="44BXNG"
        className={cn(
          "w-auto opacity-90 transition-opacity group-hover:opacity-100",
          small ? "h-6" : "h-8",
        )}
      />
    </Link>
  );
}
