import type { ReactNode } from "react";
import { tierClass } from "@/components/clay/tiers";

export interface TagProps {
  children: ReactNode;
  className?: string | undefined;
}

/**
 * Static utility pill — `ink-2` text, deliberately no hover state, so it is never mistaken for
 * an interactive control (Law of Similarity note, Design.md §3 "Common primitives"). Contrast
 * with `FilterTabs`' pills, which are interactive.
 */
export function Tag({ children, className }: TagProps) {
  const classes = [
    tierClass.utility,
    "inline-flex items-center px-[var(--space-3)] py-[var(--space-1)] text-caption font-semibold text-ink-2",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <span className={classes}>{children}</span>;
}
