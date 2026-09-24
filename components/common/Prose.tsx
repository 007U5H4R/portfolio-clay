import type { ElementType, ReactNode } from "react";

export interface ProseProps {
  children: ReactNode;
  /** Render as a different element (e.g. "article") when the context needs it. */
  as?: ElementType | undefined;
  className?: string | undefined;
}

/**
 * The flat 68ch-measure text wrapper used by every essay/chapter body (M-009 Design.md §2.2 "measure
 * ≤ 68ch"; F1-7). Always a flat zone (`data-flat`, §3.2 rule 4): it may hold `data-hand="quote"`
 * content but never a `data-decor` decoration (EVAL-018). No shadow/tint/tier. `[&_p+p]` and
 * `[&_a]` style descendant prose without a plugin.
 */
export function Prose({ children, as, className }: ProseProps) {
  const Component = (as ?? "div") as ElementType;
  const classes = [
    "max-w-[68ch] text-[length:var(--text-body)] leading-relaxed text-navy-2 [&_p+p]:mt-5 [&_a]:underline [&_a]:text-rust",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <Component data-flat="" className={classes}>
      {children}
    </Component>
  );
}
