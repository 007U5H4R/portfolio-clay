import type { ElementType, ReactNode } from "react";

export interface ProseProps {
  children: ReactNode;
  /** Render as a different element (e.g. "article") when the context needs it. */
  as?: ElementType | undefined;
  className?: string | undefined;
}

/**
 * The flat 60ch-measure text wrapper used by every essay/chapter body (Design.md §2 flat tier,
 * §3 "Common primitives"). Deliberately has NO clay props — flat text zones establish credibility
 * with no shadow/tint/tier. `[&_p+p]` and `[&_a]` style descendant prose without a plugin.
 */
export function Prose({ children, as, className }: ProseProps) {
  const Component = (as ?? "div") as ElementType;
  const classes = [
    "max-w-[60ch] text-[length:var(--text-body)] leading-relaxed text-navy-2 [&_p+p]:mt-5 [&_a]:underline [&_a]:text-rust",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return <Component className={classes}>{children}</Component>;
}
