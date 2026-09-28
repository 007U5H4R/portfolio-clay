import type { PortfolioEntry } from "./schema";

/**
 * `/projects` Portfolio carousel entries (TASK-116, Tushar's spec 2026-09-28 §5, §14–§15, §19, §21).
 *
 * One entry per PERSONAL build in `data/projects.ts`, in that file's order (the validator enforces
 * the one-to-one match, so a new personal build fails the content gate until it gets an entry here).
 * This file only holds what the carousel needs on top of the project record:
 *   - `code`      the cover's product code ("TS-01"): the product's initials plus its edition,
 *   - `coverLine` the short cover tagline. TeachSpark, RailCite and Cubicle use Tushar's own example
 *                 lines from spec §15; the rest are shortened from each project's `tagline` and add
 *                 no fact the tagline does not state,
 *   - `accent`    a paper token name (EVAL-020),
 *   - `pitchVideo` / `demoVideo` / `prdUrl` when they exist. None exist yet: TKT-22…26 (the demo
 *                 recordings) are on hold until Tushar records them. Adding one here — or a local MP4 in
 *                 the project's `links.demoVideo` — lights up the Pitch / Demo actions with no code change.
 *
 * Every other product fact (name, proposition, live link, public repo, local demo MP4) is read from
 * `data/projects.ts` by `lib/portfolio.ts`; nothing is repeated here.
 *
 * "Vendor Passport" (named in spec §5) has no record in `data/projects.ts` or in the two source
 * documents, so it is not listed (never invent a product).
 */
export const portfolioEntries: PortfolioEntry[] = [
  { slug: "teachspark", code: "TS-01", coverLine: "AI worksheets for teachers", accent: "steel" },
  { slug: "railcite", code: "RC-01", coverLine: "Research on track", accent: "rust" },
  { slug: "velora", code: "VL-01", coverLine: "Vendor onboarding, take two", accent: "forest" },
  { slug: "cubicle", code: "CB-01", coverLine: "Make work less work", accent: "navy-2" },
  { slug: "nuptis", code: "NP-01", coverLine: "Wedding vendor ops", accent: "terracotta" },
  { slug: "bhakti-vilas", code: "BV-01", coverLine: "Devotion as wellness", accent: "note" },
  { slug: "token-toli", code: "TT-01", coverLine: "Care for parents, from afar", accent: "green-2" },
  { slug: "pratyasa", code: "PR-01", coverLine: "A patent, on the record", accent: "kraft" },
  { slug: "tegaki", code: "TG-01", coverLine: "Handwriting, read by hand", accent: "rust" },
  { slug: "dino-arcade-pwa", code: "DA-01", coverLine: "Your phone, an arcade", accent: "steel" },
  { slug: "cinematic-portfolio", code: "CP-01", coverLine: "A portfolio, on film", accent: "forest" },
];
