import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface DraftingContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * Centered 1200px architectural column framed with subtle hairline side rails.
 */
export function DraftingContainer({
  children,
  className,
}: DraftingContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1200px] border-x border-neutral-900/[0.06] dark:border-white/[0.08]",
        className
      )}
    >
      {children}
    </div>
  );
}

interface DraftingDividerProps {
  className?: string;
}

/**
 * Horizontal 1px divider with circular masked Cru Gold junction dots at the rail intersections.
 */
export function DraftingDivider({ className }: DraftingDividerProps) {
  return (
    <div
      className={cn("relative h-px w-full bg-neutral-900/[0.06] dark:bg-white/[0.08]", className)}
      aria-hidden="true"
    >
      <div className="absolute left-0 top-1/2 grid size-5 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white dark:bg-cru-night">
        <span className="size-1 rounded-full bg-cru-gold" />
      </div>
      <div className="absolute right-0 top-1/2 grid size-5 translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white dark:bg-cru-night">
        <span className="size-1 rounded-full bg-cru-gold" />
      </div>
    </div>
  );
}
