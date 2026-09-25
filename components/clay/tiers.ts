/**
 * Clay tone map — the last surviving piece of the M-008 clay tier system (TSK-03 / S03.01).
 * The tier map, `ClayProps` guard and the clay primitives that read them were deleted in TKT-89
 * (S11). `Tone`/`toneClass` stay only because `components/layout/Section.tsx` (`tone` prop) and
 * `lib/stages.ts` (`stageTone`, schema-required) still consume them — see docs/reports/TKT-89.md.
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
