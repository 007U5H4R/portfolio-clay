import type { Experience } from "./schema";

/**
 * `/about` `ExperienceTimeline` data (TSK-22, TKT-40 AC 1–5; TC-094). Every field is transcribed
 * from CONTENT_INVENTORY §4.5 — no paraphrase that adds an unstated fact, no invented figure.
 * `scale` carries the literal `'not recorded'` marker for every role §4.5 marks MISSING (Shellkode,
 * Quantiphi, Godrej); AmEx's scale is the one role the résumé actually quantifies. Every outcome is
 * résumé-self-reported, so `kind: 'self-reported'` throughout — none of these figures were
 * independently measured (§4.4 last row: "no external validation on disk").
 *
 * No methodology/certification credential strings, and no DOB, phone, or address, appear here (the
 * methodology mention lives in `skills.ts`'s Execution cluster instead). "American Express (via
 * IntraEdge)" is split as `company` + `companyNote` per the schema's own comment; the two render
 * however TSK-23 composes them.
 *
 * This module imports the schema as a type only (never a value) so no client bundle pulls in zod;
 * validation runs at build time in `scripts/validate-content.ts` (prebuild) and in Vitest.
 */
export const experience: Experience[] = [
  {
    id: "godrej",
    company: "Godrej Infotech",
    title: "Assistant Product Manager",
    dates: { start: "2016-09", end: "2018-12" },
    context: "Product ownership of the Godrej Smartnet platform.",
    responsibility: "End-to-end product lifecycle ownership, roadmap definition, and driving Scrum adoption across the portfolio.",
    scale: "not recorded",
    whatChanged: "Agile/Scrum practices institutionalized across the portfolio.",
    outcomes: [
      { text: "12 features shipped in 11 months", kind: "self-reported", source: "RESUME" },
      { text: "+25% service-monitoring effectiveness", kind: "self-reported", source: "RESUME" },
      { text: "+30% team productivity", kind: "self-reported", source: "RESUME" },
      { text: "-20% turnaround time", kind: "self-reported", source: "RESUME" },
    ],
    sources: [{ id: "RESUME", label: "Résumé — Godrej Infotech", ref: "RESUME", inventory: "§4.5" }],
  },
  {
    id: "quantiphi",
    company: "Quantiphi Analytics",
    title: "Technical Project Manager, GCP Division",
    dates: { start: "2022-08", end: "2026-04" },
    context: "Enterprise cloud-native programs spanning data engineering, API modernization, and GenAI initiatives.",
    responsibility: "Program governance, charters, risk management, and cross-team dependencies.",
    scale: "not recorded",
    whatChanged:
      'DynamoDB→Cloud Spanner migrations; SQL Server transformation frameworks; HIPAA-compliant healthcare data migration; a GCP capability-building program.',
    outcomes: [
      { text: "Reduced latency and optimized operational costs (unquantified)", kind: "self-reported", source: "RESUME" },
      { text: "Zero data loss during migrations (unquantified)", kind: "self-reported", source: "RESUME" },
    ],
    sources: [{ id: "RESUME", label: "Résumé — Quantiphi Analytics", ref: "RESUME", inventory: "§4.5" }],
  },
  {
    id: "shellkode",
    company: "Shellkode",
    title: "Technical Project Manager, AWS Division",
    dates: { start: "2026-04", end: "2026-06" },
    context: "AWS delivery programs.",
    responsibility: "End-to-end program delivery; Agile/DevOps/CI-CD frameworks; executive and client engagement.",
    scale: "not recorded",
    whatChanged:
      'Org-wide adoption of the internal PM platform "Pulse"; standardized stories, acceptance criteria, docs, and repos.',
    outcomes: [
      {
        text: 'Standardized delivery practices across programs via org-wide "Pulse" adoption (qualitative outcome; no quantified metric recorded)',
        kind: "self-reported",
        source: "RESUME",
      },
    ],
    sources: [{ id: "RESUME", label: "Résumé — Shellkode", ref: "RESUME", inventory: "§4.5" }],
  },
  {
    id: "amex",
    company: "American Express",
    companyNote: "via IntraEdge",
    title: "Senior Product Manager (Accounts Receivable)",
    dates: { start: "2026-06" },
    context: "Legacy Triumph platform being migrated to the cloud-native MARS microservices platform.",
    responsibility: "Owns the Accounts Receivable transaction-capability roadmap: requirements, backlog, and Devin GenAI integration.",
    scale: "35+ capabilities, 180+ user stories, 4 Agile teams, 40+ microservices/APIs",
    whatChanged: "Legacy retirement accelerated; AI-assisted development (Devin) adopted across the MARS engineering ecosystem.",
    outcomes: [
      { text: "-30% feature delivery cycle time (self-reported)", kind: "self-reported", source: "RESUME" },
      { text: "-30% development effort with Devin GenAI adoption (self-reported)", kind: "self-reported", source: "RESUME" },
      { text: "+25% developer productivity (self-reported)", kind: "self-reported", source: "RESUME" },
    ],
    sources: [{ id: "RESUME", label: "Résumé — American Express (via IntraEdge)", ref: "RESUME", inventory: "§4.5" }],
  },
];
