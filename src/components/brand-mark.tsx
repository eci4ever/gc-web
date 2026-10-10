import { Link } from "@tanstack/react-router";
import { cn } from "cn";

export function BrandMark({ className, center = false }: { className?: string; center?: boolean }) {
  return (
    <Link to="/" className={cn("flex items-center gap-2.5", center && "justify-center", className)}>
      <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
        gc
      </div>
      <span className="font-heading text-base font-semibold">gc</span>
    </Link>
  );
}
