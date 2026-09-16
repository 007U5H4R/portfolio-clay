import type { ElementType, ReactNode } from "react";

export interface VisuallyHiddenProps {
  children: ReactNode;
  /** Render as something other than a <span> (e.g. "div") when the context needs it. */
  as?: ElementType | undefined;
  className?: string | undefined;
}

/**
 * Screen-reader-only text (Design.md §3 "Common primitives"). Visually removed but kept in the
 * accessibility tree and the DOM — used for "opens in new tab" notes, icon-only action names, and
 * any label that must be announced but not seen. Tailwind's `sr-only` is the WCAG-standard clip
 * technique (not `display:none`, which would hide it from assistive tech too).
 */
export function VisuallyHidden({ children, as, className }: VisuallyHiddenProps) {
  const Component = (as ?? "span") as ElementType;
  return <Component className={["sr-only", className].filter(Boolean).join(" ")}>{children}</Component>;
}
