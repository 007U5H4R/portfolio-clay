import type { ReactNode } from "react";
import { ROTATION_CAP, rotationStyle } from "./rotation";

/**
 * Deliberately no HTML-attribute spread: the props type has no `aria-hidden`, so a decoration can
 * never be exposed to assistive tech (Design.md §3.2 rule 6; TC-126 step 5).
 */
export type StickyProps = {
  tone?: "note" | "kraft" | undefined;
  /** Degrees; clamped to ±5 (Design.md §3.1). */
  rotate?: number | undefined;
  className?: string | undefined;
  children: ReactNode;
};

/** Sticky note (Design.md §3.1; S70.02) — one counted decoration, Caveat, always `aria-hidden`. */
export function Sticky({ tone = "note", rotate, className, children }: StickyProps) {
  return (
    <p
      data-decor="sticky"
      aria-hidden="true"
      data-tone={tone}
      className={["paper-sticky font-hand", className].filter(Boolean).join(" ")}
      style={rotationStyle(rotate, 4, ROTATION_CAP.sticky)}
    >
      {children}
    </p>
  );
}
