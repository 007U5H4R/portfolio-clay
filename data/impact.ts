import type { Metric, SourceRef } from "./schema";

// source: CONTENT_INVENTORY §4.4
/**
 * `/about` `Impact` data (TSK-24, TKT-40 AC 2; TC-095). Every metric is transcribed from
 * CONTENT_INVENTORY §4.4 — no number, percentage, or figure appears here that §4.4 does not list.
 * The §4.4 "MISSING — no external validation" row is a note, not a number, and is deliberately
 * NOT modelled as a `Metric` here.
 *
 * `MetricCard` (components/case-study/artifacts/MetricCard.tsx) throws at runtime if a metric
 * lacks `asOf` or `source` (EVAL-013), so every row below carries a real ISO `asOf` and a `source`
 * id that resolves in `impactSources` — `components/about/Impact.tsx` builds the id→SourceRef map
 * and fails loud on an unresolved id, exactly like `CaseStudyHeader`.
 *
 * §4.4 groups several figures per employer/project into one prose row; `Metric.value` is a single
 * number (the same convention `data/projects.ts` already uses for TeachSpark/RailCite), so each
 * §4.4 row is split into one `Metric` per figure rather than invented as a compound value:
 *
 *   - AmEx MARS (résumé, self-reported, résumé snapshot asOf 2026-09-15 — a defensible placeholder,
 *     flagged for Tushar in docs/reports/TSK-24.md): AR capabilities, user stories, Agile teams,
 *     cycle time, plus the separate microservices/API figure.
 *   - Devin GenAI adoption (résumé, self-reported, asOf 2026-09-15): development effort,
 *     developer productivity — "measurement method not recorded" per §4.4.
 *   - Godrej Smartnet (résumé, self-reported, asOf 2026-09-15): features shipped, monitoring
 *     effectiveness, team productivity, turnaround time.
 *   - TeachSpark pilot (measured/self-reported per figure) and RailCite corpus (measured) reuse the
 *     EXACT `value`/`label`/`context`/`asOf`/`kind`/`source` already authored in `data/projects.ts`
 *     (teachspark.metrics, teachspark chapter 07 artifact "ts-a-referrals", railcite.metrics,
 *     railcite chapter 07 artifact "rc-a-chunks") so the case-study and About surfaces never
 *     diverge on the same numbers.
 *   - "0 invented citations" is `kind:"structural"` (enforced by `RC/lib/validate.ts`, not sampled).
 *
 * This module imports the schema as a TYPE only (never a value) so no client bundle pulls in zod;
 * validation runs at build time in `scripts/validate-content.ts` (prebuild) and in Vitest.
 */

const RESUME_ASOF = "2026-09-15"; // résumé snapshot date — see the flag above

export const impactSources: SourceRef[] = [
  { id: "RESUME", label: "Résumé — Impact metrics", ref: "RESUME", inventory: "§4.4" },
  {
    id: "CS4-FINAL-PRD",
    label: "TeachSpark Final PRD",
    ref: "CS4/docs/final-prd.docx §0/§7",
    inventory: "§4.4",
  },
  {
    id: "RC-API-STATS",
    label: "RailCite live /api/stats",
    ref: "https://railcite.vercel.app/api/stats (2026-09-15)",
    inventory: "§4.4",
    url: "https://railcite.vercel.app",
  },
  {
    id: "RC-FINAL-PRD",
    label: "RailCite Final PRD",
    ref: "CS5/docs/final-prd.docx §0/§6/§7.1/§8",
    inventory: "§4.4",
  },
  {
    id: "RC-VALIDATE",
    label: "RailCite citation validator",
    ref: "RC/lib/validate.ts",
    inventory: "§4.4",
  },
];

export const impactMetrics: Metric[] = [
  // ── AmEx MARS — résumé, self-reported (RESUME_ASOF placeholder, flagged) ──────────────────
  {
    value: "35+",
    label: "AR capabilities delivered",
    context: "AmEx MARS Accounts Receivable migration, Jun 2026–present; self-reported in résumé",
    asOf: RESUME_ASOF,
    kind: "self-reported",
    source: "RESUME",
  },
  {
    value: "180+",
    label: "User stories",
    context: "AmEx MARS Accounts Receivable migration, Jun 2026–present; self-reported in résumé",
    asOf: RESUME_ASOF,
    kind: "self-reported",
    source: "RESUME",
  },
  {
    value: "4",
    label: "Agile teams",
    context: "AmEx MARS Accounts Receivable migration, Jun 2026–present; self-reported in résumé",
    asOf: RESUME_ASOF,
    kind: "self-reported",
    source: "RESUME",
  },
  {
    value: "-30%",
    label: "Feature delivery cycle time",
    context: "AmEx MARS Accounts Receivable migration, Jun 2026–present; self-reported in résumé",
    asOf: RESUME_ASOF,
    kind: "self-reported",
    source: "RESUME",
  },
  {
    value: "40+",
    label: "Cloud-native microservices/API capabilities",
    context: "AmEx MARS Accounts Receivable migration; self-reported in résumé",
    asOf: RESUME_ASOF,
    kind: "self-reported",
    source: "RESUME",
  },

  // ── Devin GenAI adoption (AmEx MARS) — résumé, self-reported ──────────────────────────────
  {
    value: "-30%",
    label: "Development effort (Devin GenAI)",
    context:
      "Devin GenAI adoption in the MARS engineering ecosystem; measurement method not recorded; self-reported in résumé",
    asOf: RESUME_ASOF,
    kind: "self-reported",
    source: "RESUME",
  },
  {
    value: "+25%",
    label: "Developer productivity (Devin GenAI)",
    context:
      "Devin GenAI adoption in the MARS engineering ecosystem; measurement method not recorded; self-reported in résumé",
    asOf: RESUME_ASOF,
    kind: "self-reported",
    source: "RESUME",
  },

  // ── Godrej Smartnet — résumé, self-reported ───────────────────────────────────────────────
  {
    value: "12",
    label: "Features shipped in 11 months",
    context: "Godrej Smartnet platform, Sep 2016–Dec 2018; self-reported in résumé",
    asOf: RESUME_ASOF,
    kind: "self-reported",
    source: "RESUME",
  },
  {
    value: "+25%",
    label: "Service-monitoring effectiveness",
    context: "Godrej Smartnet platform, Sep 2016–Dec 2018; self-reported in résumé",
    asOf: RESUME_ASOF,
    kind: "self-reported",
    source: "RESUME",
  },
  {
    value: "+30%",
    label: "Team productivity",
    context: "Godrej Smartnet platform, Sep 2016–Dec 2018; self-reported in résumé",
    asOf: RESUME_ASOF,
    kind: "self-reported",
    source: "RESUME",
  },
  {
    value: "-20%",
    label: "Turnaround time",
    context: "Godrej Smartnet platform, Sep 2016–Dec 2018; self-reported in résumé",
    asOf: RESUME_ASOF,
    kind: "self-reported",
    source: "RESUME",
  },

  // ── TeachSpark pilot — REUSED verbatim from data/projects.ts (teachspark.metrics + the
  //    chapter-07 "ts-a-referrals" artifact) so this surface never diverges from the case study. ──
  {
    value: "17",
    label: "Teachers joined",
    context:
      "joined the WhatsApp pilot in its first week; Final-PRD snapshot 2026-08-24, test handsets excluded",
    asOf: "2026-08-24",
    kind: "measured",
    source: "CS4-FINAL-PRD",
  },
  {
    value: "8 (47%)",
    label: "Activated",
    context:
      "of 17 joined reached an activation event (12 onboarded first, 71%); snapshot 2026-08-24, test handsets excluded",
    asOf: "2026-08-24",
    kind: "measured",
    source: "CS4-FINAL-PRD",
  },
  {
    value: "37.5 min",
    label: "Median time saved",
    context:
      "self-reported median time saved per activated teacher; snapshot 2026-08-24, test handsets excluded",
    asOf: "2026-08-24",
    kind: "self-reported",
    source: "CS4-FINAL-PRD",
  },
  {
    value: "3",
    label: "Referrals",
    context:
      "teacher-reported referrals during the first-week pilot; snapshot 2026-08-24, test handsets excluded",
    asOf: "2026-08-24",
    kind: "self-reported",
    source: "CS4-FINAL-PRD",
  },

  // ── RailCite corpus — REUSED verbatim from data/projects.ts (railcite.metrics + the
  //    chapter-07 "rc-a-chunks" artifact). Each figure keeps its own true asOf from that source
  //    (2026-09-15 live /api/stats for docs/chunks/citations; 2026-09-07 Final-PRD ingest run for
  //    the OCR share) rather than being flattened to one date. ─────────────────────────────────
  {
    value: "5,760",
    label: "Documents indexed",
    context:
      "live corpus of Indian Railways commercial circulars from /api/stats; grows as the nightly crawl ingests new PDFs",
    asOf: "2026-09-15",
    kind: "measured",
    source: "RC-API-STATS",
  },
  {
    value: "14,406",
    label: "Chunks indexed (live)",
    context:
      "live /api/stats on 2026-09-15; the corpus is cited live-with-date because the nightly crawl keeps ingesting new circulars",
    asOf: "2026-09-15",
    kind: "measured",
    source: "RC-API-STATS",
  },
  {
    value: "68%",
    label: "Ingested PDFs needing OCR",
    context: "3,865 of 5,687 ingested PDFs required OCR; Final-PRD ingest run, 7 Sep 2026",
    asOf: "2026-09-07",
    kind: "measured",
    source: "RC-FINAL-PRD",
  },

  // ── "0 invented citations" — structural, enforced by the validator, not sampled ──────────
  {
    value: "0",
    label: "Invented citations",
    context: "by construction (lib/validate.ts)",
    asOf: "2026-09-15",
    kind: "structural",
    source: "RC-VALIDATE",
  },
];
