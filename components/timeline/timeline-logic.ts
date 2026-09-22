/**
 * timeline-logic.ts (TKT-41) — the pure, framework-free state/parse helpers behind
 * `ExperienceTimeline`. Kept out of the `"use client"` component so the one-open-at-a-time reducer,
 * the deep-link hash parser, and the roving-focus index maths can be unit-tested directly
 * (tests/unit/timeline-logic.test.ts) without mounting React or pulling `motion/react` into jsdom.
 */

/** The `/about` section anchor — kept working for the `/work` ExperienceStrip + Ask evidence links. */
export const SECTION_ANCHOR = "experience";

/** DOM id of a role's StoryCard: the `aria-controls` target AND the `#experience-<id>` hash target. */
export function storyCardId(roleId: string): string {
  return `${SECTION_ANCHOR}-${roleId}`;
}

/**
 * Resolve a location hash to the role that should open on load. Accepts `#experience-<id>` and
 * returns `<id>` only when it names one of the known roles; returns `null` for the bare
 * `#experience` section anchor, an empty hash, or any unknown target — so a stray or stale hash
 * never opens a phantom card (AC 2 deep link, e.g. `/about#experience-amex`).
 */
export function roleIdFromHash(hash: string, knownIds: readonly string[]): string | null {
  const clean = hash.replace(/^#/, "");
  const prefix = `${SECTION_ANCHOR}-`;
  if (!clean.startsWith(prefix)) return null;
  const id = clean.slice(prefix.length);
  return knownIds.includes(id) ? id : null;
}

/**
 * Next open-state for the single-open accordion (AC 3): clicking the already-open role closes it
 * (`null`); clicking any other role replaces the open one — so exactly one card is ever open and
 * opening another closes the first.
 */
export function toggleOpen(current: string | null, clicked: string): string | null {
  return current === clicked ? null : clicked;
}

/** Index of the node to focus after an arrow key (AC 2), wrapping around both ends. */
export function nextNodeIndex(current: number, delta: 1 | -1, count: number): number {
  if (count <= 0) return current;
  return (current + delta + count) % count;
}

/**
 * True when an outcome's own text already spells out its `kind` (e.g. AmEx's
 * "…(self-reported)"), so the StoryCard can suppress the redundant kind badge and avoid printing
 * the same qualifier twice — while keeping every outcome's text verbatim (TKT-41 AC 1 honesty rule).
 */
export function textStatesKind(text: string, kindLabel: string): boolean {
  return text.toLowerCase().includes(kindLabel.toLowerCase());
}
