/**
 * The deliberate failing fixture (technical-plan.md §B S03.06, A3 rule 6). A copy of the real
 * TeachSpark project with exactly three planted defects, each of which `validateAll()` must catch:
 *   1. `metrics[0]` is missing `asOf`      → schema issue at `metrics.0.asOf`
 *   2. `sources` is empty                  → schema issue at `sources` (min 1)
 *   3. `statusLabel` is a banned title     → forbidden-content issue at `statusLabel`
 *
 * It proves the EVAL-013 build gate (S03.08). Imported by exactly two files: this ticket's
 * `tests/unit/content-gate.test.ts` and `scripts/validate-content.ts` (under CONTENT_FIXTURE=invalid).
 * It never lives under `data/`, so it can never leak into a real build.
 */
import { teachspark } from "@/data/projects";

export const invalidProject = {
  ...teachspark,
  // (3) banned title string — must never be used as a status/role/title (A3 rule 5, S8).
  statusLabel: "AI Product Manager",
  // (2) no declared sources — violates Project.sources.min(1).
  sources: [],
  // (1) a metric missing its required `asOf` date.
  metrics: [
    {
      value: "8",
      label: "Activated teachers",
      context: "week 1 of the pilot, test handsets excluded",
      kind: "self-reported",
      source: "TS-README-3",
    },
  ],
};
