/**
 * Home Featured Work presentation (TASK-133, Tushar's spec 2026-09-29, `docs/redesign-mockups/m-009/
 * tushar-2026-09-29/featured-work-spec.md`).
 *
 * WHICH products the section shows is the `featured` rank in `data/projects.ts` (the one data source the
 * content gate already checks: exactly three personal builds, ranks 1/2/3; rank 1 is the large anchor):
 *   1 RailCite · 2 Slag City · 3 Campfire Board.
 * This file only adds what the section needs on top of each record. Every product FACT (name, tags,
 * metrics and their kind/asOf, the short cover line) is read from `data/projects.ts` /
 * `data/portfolio.ts` by `components/projects/FeaturedWork.tsx`; nothing is retyped here.
 *
 *   - `line`    an optional one-line description. RailCite's is Tushar's own line from the spec (§4), a
 *               paraphrase of its record tagline; Slag City and Campfire Board have none (spec §6–§8:
 *               no invented descriptions — they show their verified cover line only).
 *   - `metrics` the `project.metrics` rows to show, by label (looked up, never retyped; a missing label
 *               fails the build). Only RailCite has recorded metrics.
 *   - `cta`     the Explore label (spec §15). Every Explore goes to `/projects?product=<slug>`.
 *   - `art`     the hand-authored collage (illustration manifest id; scripts/portfolio-art/featured/).
 */
export interface FeaturedPresentation {
  line?: string | undefined;
  metrics: readonly string[];
  cta: string;
  art: "featured-railcite" | "featured-slag-city" | "featured-campfire-board";
}

export const featuredPresentation: Readonly<Record<string, FeaturedPresentation>> = {
  railcite: {
    line: "A trust-first assistant for citing the right railway rule without inventing authority.",
    metrics: ["Documents indexed", "Invented citations"],
    cta: "Explore case study",
    art: "featured-railcite",
  },
  "slag-city": { metrics: [], cta: "Explore", art: "featured-slag-city" },
  "campfire-board": { metrics: [], cta: "Explore", art: "featured-campfire-board" },
};
