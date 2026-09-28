import { experience } from "@/data/experience";

/**
 * `/about` hero copy + numbers (TASK-117 — Tushar's About hero spec 2026-09-28 §30, verbatim; the
 * reference of record is `docs/redesign-mockups/m-009/tushar-2026-09-28/about-hero-spec.md`).
 *
 * Content truth (carried over from TKT-86; nothing new is claimed):
 *   - "10+ years" = the earliest `data/experience.ts` start year (2016) to the résumé snapshot year
 *     (2026, `data/impact.ts` RESUME_ASOF); "+" because the AmEx role is still open ("present").
 *     Derived, never hard-coded — the footnote names the year and the open role from the same data.
 *   - "3 industries" re-groups `ProductJourney`'s four stages (the two AI stages folded into one).
 *   - "∞ curiosity" is not a metric — the VERIFIED framing word from CONTENT_INVENTORY §4.1.
 *   - The headline, subline, quote and notes are Tushar's own words (spec §30), so the TKT-86
 *     `DraftTag`s are gone from this section (spec §5 / §31).
 */

// Earliest experience start year (data/experience.ts) — derived, never hard-coded.
const EARLIEST_START_YEAR = Math.min(...experience.map((role) => Number(role.dates.start.slice(0, 4))));
// Matches data/impact.ts's RESUME_ASOF snapshot year (2026-09-15) — the anchor year of /about's numbers.
const RESUME_ASOF_YEAR = 2026;
const YEARS_BUILDING = RESUME_ASOF_YEAR - EARLIEST_START_YEAR;
// The open-ended role that makes the span "N+" (dates.end absent = "present").
const OPEN_ROLE = experience.find((role) => role.dates.end === undefined);

/** Spec §7 / §8: value colour per column — rust · navy · forest (the "muted teal/green" token). */
export const ABOUT_STATS = [
  { value: `${YEARS_BUILDING}+`, label: "years building products", tone: "rust" },
  { value: "3", label: "industries — physical → cloud → AI", tone: "navy" },
  { value: "∞", label: "curiosity", tone: "forest" },
] as const;

export const ABOUT_STATS_HOW = `counted from ${EARLIEST_START_YEAR} — the “+” is because ${
  OPEN_ROLE ? `the ${OPEN_ROLE.company} role` : "the current role"
} is still open`;

/** Spec §4: three lines, the third in terracotta (the culmination). */
export const ABOUT_HEADLINE = ["I started with machines.", "Then systems. Then people.", "Now, intelligent products."] as const;

export const ABOUT_SUBLINE = "Same curiosity → bigger problems.";
export const ABOUT_PERSONAL_NOTE = "coffee first. then the roadmap.";
export const ABOUT_PULL_QUOTE = "I build at the intersection of people, products and intelligent systems.";
export const ABOUT_POLAROID_CAPTION = "Bigger problems. Brighter mornings.";
export const ABOUT_VENN = ["People", "Products", "Intelligent Systems"] as const;
export const ABOUT_CHECKLIST = ["Better tools", "More capable people", "A more thoughtful future"] as const;
export const ABOUT_COLLAGE_NOTE = "same curiosity, still here.";
