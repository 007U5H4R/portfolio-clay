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

/**
 * Glass is the compacted-header treatment ONLY — NOT a clay tier (Design.md §2: "Glass … is
 * reserved for the compacted header only — never combined with clay shadows on the same
 * element"). It is exported here, separate from `tierClass`, precisely so it can never be
 * selected through the tier map; the class body lives in `app/globals.css` (`.glass`, S04.05).
 * Consumed only by `Header` in its compact state — never by a clay primitive.
 */
export const headerGlassClass = "glass";

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

/**
 * Discriminated on `tier` (D1) — the type is the guardrail against overusing the clay effect:
 *   - `flat`    accepts only `tone:'neutral'` and `interactive:false` (no shadow → nothing to
 *               lift, no tint → `{tier:'flat', tone:'lavender'}` and `{tier:'flat',
 *               interactive:true}` are compile-time errors).
 *   - `utility` accepts any tone but `interactive` is forbidden here: Design.md §2 gives the
 *               utility tier "`--shadow-utility` only, no press state", so a utility clay surface
 *               is never a hover/press control. The one interactive utility-radius control on the
 *               site — the filter pill — is `ClayPill variant="filter"`, which owns its own
 *               hover/active classes and does NOT flow through `ClayProps.interactive`
 *               (so `{tier:'utility', interactive:true}` is a compile-time error).
 *   - `hero`/`card` are the only tiers that may be `interactive` (full rest/hover/press physics).
 */
export type ClayProps =
  | { tier: "flat"; tone?: "neutral" | undefined; interactive?: false | undefined }
  | { tier: "utility"; tone?: Tone | undefined; interactive?: false | undefined }
  | { tier: "hero" | "card"; tone?: Tone | undefined; interactive?: boolean | undefined };
