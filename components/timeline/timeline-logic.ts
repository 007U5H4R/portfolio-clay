/**
 * timeline-logic.ts (TKT-41, trimmed in TKT-87) — the pure helpers behind `ExperienceTimeline`.
 *
 * TKT-87 (Design.md §11 Dev-11): every story card renders open, so the click-to-open reducer, the
 * deep-link hash parser and the roving-focus maths are gone. What stays is the anchor contract
 * (`#experience` and `#experience-<id>`, used by the `/work` experience strip and Ask evidence
 * links) and the no-double-qualifier rule for outcome badges.
 */

/** The `/about` section anchor — kept working for the `/work` ExperienceStrip + Ask evidence links. */
export const SECTION_ANCHOR = "experience";

/**
 * The timeline lead (S18). The data runs oldest → newest and the timeline maps it unreversed, so
 * the lead says so. tests/unit/experience-skills.test.ts (TC-167) pins this exact string.
 */
export const TIMELINE_LEAD =
  "Four roles, oldest to newest — open any node for the context, scale, and what changed.";

/** DOM id of a role's timeline entry: the `#experience-<id>` deep-link target. */
export function storyCardId(roleId: string): string {
  return `${SECTION_ANCHOR}-${roleId}`;
}

/**
 * True when an outcome's own text already spells out its `kind` (e.g. AmEx's
 * "…(self-reported)"), so the StoryCard can suppress the redundant kind badge and avoid printing
 * the same qualifier twice — while keeping every outcome's text verbatim (TKT-41 AC 1 honesty rule).
 */
export function textStatesKind(text: string, kindLabel: string): boolean {
  return text.toLowerCase().includes(kindLabel.toLowerCase());
}
