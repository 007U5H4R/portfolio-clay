import type { ReactNode } from "react";
import { ROTATION_CAP, rotationStyle } from "./rotation";

/** No HTML-attribute spread — the props type has no `aria-hidden` (Design.md §3.2 rule 6). */
export type NoteProps = {
  tone?: "paper-2" | "note" | "kraft" | undefined;
  /** Dashed-kraft stamp look (about.html `.pstamp` — the patent "TP" stamp). */
  stamp?: boolean | undefined;
  /** Degrees; clamped to ±6 (Design.md §3.1). */
  rotate?: number | undefined;
  className?: string | undefined;
  children: ReactNode;
};

/**
 * A free scrap carrying no data — stamp, decorative label (Design.md §3.1; S70.02). One counted
 * decoration, Caveat, always `aria-hidden`.
 */
export function Note({ tone = "paper-2", stamp = false, rotate, className, children }: NoteProps) {
  return (
    <span
      data-decor="note"
      aria-hidden="true"
      data-tone={tone}
      data-stamp={stamp ? "" : undefined}
      className={["paper-note font-hand", className].filter(Boolean).join(" ")}
      style={rotationStyle(rotate, 6, ROTATION_CAP.note)}
    >
      {children}
    </span>
  );
}
