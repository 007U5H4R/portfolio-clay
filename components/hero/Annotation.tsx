import type { CSSProperties } from "react";

export interface AnnotationProps {
  className?: string | undefined;
}

/**
 * Handwritten decorative scribble near the CTA row (Design.md §3 — at most one in the hero,
 * ≤6° rotation, Caveat). Purely decorative, so `aria-hidden` — it carries no information a
 * screen-reader user would miss. Font from the `--font-hand` (Caveat) token.
 *
 * The headline's "AI-native products" reveal wash (`.hero-highlight` + `@keyframes wash`) lives
 * in app/globals.css (S05.04) and is applied to the `<span>` inside the `Hero` `<h1>`.
 */
export function Annotation({ className }: AnnotationProps) {
  const style: CSSProperties = { fontFamily: "var(--font-hand)" };
  return (
    <span
      aria-hidden="true"
      style={style}
      className={["inline-block rotate-[-4deg] text-[1.5rem] leading-none text-ink-3", className]
        .filter(Boolean)
        .join(" ")}
    >
      ideas → impact
    </span>
  );
}
