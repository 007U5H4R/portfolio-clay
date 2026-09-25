/**
 * Clay tier map + tone map + the discriminated `ClayProps` guard (TSK-03 / S03.01).
 *
 * Every clay primitive (`ClayCard`, `ClayTile`, `ClayFrame`, `ClayIcon`, `StatusBadge`) reads
 * its rest-state visual language from here, never inventing its own radius/shadow/gradient
 * literals — Design.md §2's clay-tier table is the single source of truth for which token set
 * a tier may use.
 *
 * D1: `tier:'flat'` structurally forbids a tone other than `'neutral'` (and forbids
 * `interactive`), so `{ tier:'flat', tone:'lavender' }` is a compile-time type error, not a
 * runtime check.
 */

/** Design.md §2's seven clay tones (`neutral` = the untinted/utility default). */
export type Tone = "neutral" | "lavender" | "sky" | "mint" | "blush" | "peach" | "butter";

/** Tone tint classes — always paired with `ink` text (Design.md §2 contrast rule). */
export const toneClass: Record<Tone, string> = {
  neutral: "bg-ivory text-navy-2",
  lavender: "bg-paper-2/30 text-navy",
  sky: "bg-green-2/30 text-navy",
  mint: "bg-forest/30 text-navy",
  blush: "bg-steel/30 text-navy",
  peach: "bg-note/30 text-navy",
  butter: "bg-kraft/30 text-navy",
};
