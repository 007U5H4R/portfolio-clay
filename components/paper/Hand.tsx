import type { ReactNode } from "react";
import { enforcing, paperViolation, textOf } from "./enforce";

export type HandKind = "quote" | "cta" | "label";

export type HandProps = {
  kind: HandKind;
  /** Element; defaults to `blockquote` for a quote, `span` otherwise (Design.md §3.4). */
  as?: "blockquote" | "p" | "q" | "span" | "b" | "dt" | undefined;
  /**
   * Required for `kind="quote"` (§3.4): the source, rendered as the quote's next sibling. A string
   * becomes `<cite class="hand-cite">`; an element (e.g. an `sr-only` "Source: …" span) renders
   * as given.
   */
  cite?: ReactNode | undefined;
  className?: string | undefined;
  children: ReactNode;
};

/** §3.4 limits. */
export const HAND_LIMITS = { quoteChars: 240, ctaWords: 6, labelWords: 3 } as const;

/** Words = whitespace-separated tokens carrying a letter or digit (arrows like "→" don't count). */
export function handWords(text: string): string[] {
  return text.split(/\s+/).filter((t) => /[\p{L}\p{N}]/u.test(t));
}

/** The §3.4 violation for `text` rendered as `kind`, or `null` when it is within its limit. */
export function handViolation(kind: HandKind, text: string, hasCite: boolean): string | null {
  const trimmed = text.trim();
  if (kind === "quote") {
    if (trimmed.length > HAND_LIMITS.quoteChars) {
      return `quote is ${trimmed.length} characters; the limit is ${HAND_LIMITS.quoteChars}`;
    }
    if (!hasCite) return "quote has no cite / Source:";
    return null;
  }
  const words = handWords(trimmed);
  if (kind === "cta") {
    return words.length > HAND_LIMITS.ctaWords ? `cta is ${words.length} words; the limit is ${HAND_LIMITS.ctaWords}` : null;
  }
  if (words.length > HAND_LIMITS.labelWords) return `label is ${words.length} words; the limit is ${HAND_LIMITS.labelWords}`;
  const badDigits = words.filter((w) => /\d/.test(w) && !/^\d{2}$/.test(w));
  if (badDigits.length > 0) return `label has digits other than a 2-digit numeral: "${badDigits.join(" ")}"`;
  return null;
}

/**
 * A Caveat exemption (Design.md §3.4; S70.07): `data-hand="quote" | "cta" | "label"` on a plain
 * element in `font-hand`. The limit is enforced at render — throws in test, `console.error` in dev,
 * inert in production — and EVAL-018 re-measures it in the built pages. Server component.
 */
export function Hand({ kind, as, cite, className, children }: HandProps) {
  const hasCite = cite !== undefined && cite !== null && cite !== false && cite !== "";
  if (enforcing()) {
    const problem = handViolation(kind, textOf(children), hasCite);
    if (problem) paperViolation(`<Hand kind="${kind}">: ${problem} (Design.md §3.4).`);
  }
  const Component = as ?? (kind === "quote" ? "blockquote" : "span");
  const element = (
    <Component data-hand={kind} className={["font-hand", className].filter(Boolean).join(" ")}>
      {children}
    </Component>
  );
  if (kind !== "quote" || !hasCite) return element;
  return (
    <>
      {element}
      {typeof cite === "string" ? <cite className="hand-cite">{cite}</cite> : cite}
    </>
  );
}
