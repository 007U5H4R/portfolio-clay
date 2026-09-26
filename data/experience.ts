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
 *
 * `location` (TKT-101) is the city CONTENT_INVENTORY §4.5 records beside each role (RESUME), shown on
 * the `/work` Experience timeline's city chip — Tushar's call (2026-09-26, Design.md §11 Dev-45). It
 * is the employer's city, not a personal address; `site.showLocation` (his own location) stays false.
 *
 * `highlights` (TKT-101 round 2) are the `/work` card bullets, transcribed verbatim from Tushar's
 * reference `docs/redesign-mockups/m-009/tushar-2026-09-26/work-experience-target.png` — his call
 * ("image wins", 2026-09-26). Any bullet carrying a figure keeps the site's "(self-reported)" label,
 * matching the `outcomes` below (résumé figures, never independently measured). The company / title
 * edits for Quantiphi and the en dash in the two division titles come from the same image.
 */
export const experience: Experience[] = [
  {
    id: "godrej",
    highlights: [
      "Directed the end-to-end product lifecycle of the Godrej Smartnet platform.",
      "Delivered 12 high-impact features in 11 months (self-reported).",
      "Improved service monitoring by 25% and team productivity by 30% (self-reported).",
    ],
    location: "Mumbai", // CONTENT_INVENTORY §4.5 (RESUME) — city only
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
    highlights: [
      "Led enterprise cloud-native programs across data engineering, API modernization, and Generative AI initiatives.",
      "Spearheaded modernization initiatives such as DynamoDB-to-Spanner migration and other data platform programs.",
      "Delivered HIPAA-compliant healthcare migration and GCP capability-building programs across strategic engagements.",
    ],
    location: "Bengaluru", // CONTENT_INVENTORY §4.5 (RESUME) — city only
    company: "Quantiphi Analytics Solutions Pvt. Ltd.",
    title: "Technical Project Manager – GCP Division",
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
    highlights: [
      "Directed end-to-end program delivery from solution strategy to production deployment.",
      "Established Agile delivery frameworks, DevOps, and CI/CD practices to improve execution efficiency.",
      "Drove adoption of Shellkode’s internal project management platform, Pulse, with better reporting and governance.",
    ],
    location: "Bengaluru", // CONTENT_INVENTORY §4.5 (RESUME) — city only
    company: "Shellkode",
    title: "Technical Project Manager – AWS Division",
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
    highlights: [
      "Owned the roadmap for Accounts Receivable transaction capabilities and migration from Triumph to MARS microservices.",
      "Prioritized 180+ user stories across four Agile teams, helping reduce delivery cycle time by 30% (self-reported).",
      "Enabled Devin GenAI adoption to improve developer productivity and accelerate AR modernization.",
    ],
    location: "Bengaluru", // CONTENT_INVENTORY §4.5 (RESUME) — city only
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
