/**
 * `/about`'s Awards · Research · Education content (TKT-42, CONTENT_INVENTORY §4.6–4.8). Every
 * string here is transcribed verbatim from the résumé/certificate — never reworded into a new
 * claim, matching the discipline `data/skills.ts`/`data/experience.ts` already apply. Deliberately
 * plain TS (no zod schema, no `Collections`/`validateAll()` wiring) — like `data/impact.ts`, this
 * is a small, self-contained module whose own truth/structure assertions live in
 * `tests/unit/credentials.test.ts`, not the prebuild content gate.
 *
 * The two banner-only credential claims CONTENT_INVENTORY §4.6 calls out as "Not in RESUME" are
 * deliberately excluded — never add a project-management or agile-methodology certification claim
 * to `awards` (the forbidden-strings scanner — scripts/forbidden-strings.ts — also enforces this
 * across `data/**`).
 *
 * TRUTH NON-NEGOTIABLES (do not "fix" these without re-reading CONTENT_INVENTORY §4.7 first):
 *   - The patent number is `IN 429867` (certificate wins) — the résumé misprints its SL No.
 *     ("044152784") as the patent number; that string never appears here.
 *   - The Soft Matter paper's DOI and author list are MISSING on the résumé — `doi` stays
 *     `undefined` so `Research.tsx` renders "DOI pending", never a fabricated DOI.
 */

export interface Award {
  id: string;
  title: string;
  year: string;
  /** CONTENT_INVENTORY §4.6 row this transcribes. */
  source: string;
}

// source: CONTENT_INVENTORY §4.6 (RESUME Awards; certificates MISSING)
export const awards: Award[] = [
  {
    id: "gcp-partner-all-star",
    title: "Google Cloud Partner All-Star: Delivery Excellence",
    year: "2024",
    source: "RESUME Awards",
  },
  {
    id: "quantiphi-unsung-hero",
    title: "Annual Unsung Hero Award, Quantiphi Analytics Solutions",
    year: "2024",
    source: "RESUME Awards",
  },
  {
    id: "godrej-12-in-11",
    title: "12 in 11 Award, Godrej Infotech",
    year: "2018",
    source: "RESUME Awards",
  },
];

export interface Patent {
  number: string;
  title: string;
  application: string;
  filed: string;
  granted: string;
  patentee: string;
  inventors: string[];
  href: string;
  source: string;
}

// source: CONTENT_INVENTORY §4.7 (PT/discoveryPRD.md §4 FACT-LOCK, from certificate
// PT/Ed__6d16ff33-…pdf) — the certificate wins over RESUME, which prints the SL No. as the patent
// number.
export const patent: Patent = {
  number: "IN 429867",
  title:
    "A Low-Cost Portable Electrochemical Biosensor for Rapid Detection of Endotoxin and Method Thereof",
  application: "202241053140",
  filed: "16 Sep 2022",
  granted: "24 Apr 2023",
  patentee: "NIT–Calicut",
  inventors: ["Dr. N. Sandhyarani", "Tushar Pathak", "Haritha K", "Dr. Arun R", "Dr. M. K. Ravi Varma"],
  href: "https://pratyasa.vercel.app",
  source: "PT/discoveryPRD.md §4 FACT-LOCK; RESUME (prints SL No. as patent no. — certificate wins)",
};

export interface ResearchPaper {
  id: string;
  /** Undefined when the author list is MISSING (Soft Matter — §4.7). */
  authors?: string | undefined;
  title: string;
  journal: string;
  year: string;
  volumeIssue?: string | undefined;
  /** Undefined when the DOI is MISSING — the component renders "DOI pending", never a guess. */
  doi?: string | undefined;
  doiHref?: string | undefined;
  source: string;
}

// source: CONTENT_INVENTORY §4.7
export const papers: ResearchPaper[] = [
  {
    id: "langmuir-2025",
    authors: "Kuttoth, H.; Pathak, T.; Sandhyarani, N.",
    title: "A Point-of-Care Aptasensor for the Real-Time Detection of Sepsis Biomarker",
    journal: "Langmuir",
    year: "2025",
    volumeIssue: "41(26)",
    doi: "10.1021/acs.langmuir.5c00784",
    doiHref: "https://doi.org/10.1021/acs.langmuir.5c00784",
    source: "PT/discoveryPRD.md §4; RESUME Paper Publications (local PDF not redistributed — DOI linked instead)",
  },
  {
    id: "soft-matter-2023",
    // authors: MISSING (§4.7 — RESUME lists the title only)
    title:
      "Topological Phases in Nanoparticle Monolayers: Why Crystalline, Hexatic, and Isotropic-Fluid Phases Coexist at the Same Temperature",
    journal: "Soft Matter, RSC",
    year: "2023",
    // doi: MISSING — never fabricate; Research.tsx renders "DOI pending".
    source: "RESUME Paper Publications — DOI + author list MISSING",
  },
];

/** source: CONTENT_INVENTORY §4.7 (PT/discoveryPRD.md Global Constraints + footer copy L199) */
export const researchDisclaimer =
  "Patent owned by NIT–Calicut; research prototype, not an approved diagnostic.";

export interface EducationEntry {
  id: string;
  degree: string;
  /** "<institution>, <city>" as the résumé prints it — `/work` splits the city off at the last comma. */
  institution: string;
  year: string;
  source: string;
  /**
   * Card bullets for the `/work` Education timeline (TKT-101 round 2): transcribed verbatim from
   * Tushar's reference `education-target.png` at his direction ("Generate the education bullets",
   * 2026-09-26). The NIT research bullet is consistent with `papers` (Langmuir; Soft Matter, RSC) and
   * `patent` (portable electrochemical biosensor, granted, patentee NIT–Calicut) below.
   */
  highlights?: string[];
}

// source: CONTENT_INVENTORY §4.8 (RESUME Education)
export const education: EducationEntry[] = [
  {
    id: "mtech-nitc",
    degree: "M.Tech., Nanotechnology",
    institution: "National Institute of Technology Calicut, Kozhikode",
    year: "2022",
    source: "RESUME Education",
    highlights: [
      "Built advanced expertise in nanotechnology, materials science, and applied research.",
      "Worked on research involving biosensors, nanoparticle monolayers, and real-world scientific problem solving.",
      "Published research in ‘Langmuir’ and ‘Soft Matter’, and contributed to a granted patent for a portable electrochemical biosensor.",
    ],
  },
  {
    id: "be-bitd",
    degree: "B.E., Mechanical Engineering",
    institution: "Bhilai Institute of Technology, Durg",
    year: "2016",
    source: "RESUME Education",
    highlights: [
      "Developed a strong foundation in core engineering, analytical thinking, and structured problem solving.",
      "Built early systems-thinking and technical fundamentals that later supported the transition into product, cloud, and AI leadership.",
      "Strengthened teamwork, execution discipline, and engineering-first decision making.",
    ],
  },
];

/** source: CONTENT_INVENTORY §4.8 (RESUME Personal Details) — optional, not PII. */
export const languages: string[] = ["English", "Hindi", "Bengali"];
