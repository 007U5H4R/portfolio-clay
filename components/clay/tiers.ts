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

export type Tier = "hero" | "card" | "utility" | "flat";

/** Design.md §2's seven clay tones (`neutral` = the untinted/utility default). */
export type Tone = "neutral" | "lavender" | "sky" | "mint" | "blush" | "peach" | "butter";

/** Rest-state classes per tier — only the tokens Design.md §2's clay-tier table allows. */
export const tierClass: Record<Tier, string> = {
  hero: "rounded-[34px] shadow-[var(--shadow-clay-rest)] bg-[image:var(--gradient-clay-volume)]",
  card: "rounded-[var(--radius-clay)] shadow-[var(--shadow-clay-rest)] bg-[image:var(--gradient-clay-volume)]",
  utility: "rounded-[var(--radius-utility)] shadow-[var(--shadow-utility)]",
  flat: "",
};

/** Tone tint classes — always paired with `ink` text (Design.md §2 contrast rule). */
export const toneClass: Record<Tone, string> = {
  neutral: "bg-surface text-ink-2",
  lavender: "bg-lavender/30 text-ink",
  sky: "bg-sky/30 text-ink",
  mint: "bg-mint/30 text-ink",
  blush: "bg-blush/30 text-ink",
  peach: "bg-peach/30 text-ink",
  butter: "bg-butter/30 text-ink",
};

/**
 * Discriminated on `tier`: the `flat` branch only accepts `tone:'neutral'` and
 * `interactive:false` — anything else against `tier:'flat'` fails to type-check (D1).
 */
export type ClayProps =
  | { tier: "flat"; tone?: "neutral" | undefined; interactive?: false | undefined }
  | { tier: Exclude<Tier, "flat">; tone?: Tone | undefined; interactive?: boolean | undefined };
