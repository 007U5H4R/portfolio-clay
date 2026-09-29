import type { z } from "zod";
import type { CaseStudy } from "../schema";

/**
 * Tegaki — a human craft, carefully productized (TASK-130; audit in docs/reports/TASK-130/tegaki.md).
 * Facts from CONTENT_INVENTORY §8.9 (extra sources below) + the live pilot's own screens. No AI in
 * the product; the checkout confirms without charging; no pilot users or orders are recorded; no
 * learnings are recorded, so there is no learnings section. The internal prompt is never named.
 */
export const tegakiCase: z.input<typeof CaseStudy> = {
  slug: "tegaki",
  theme: {
    key: "tegaki",
    metaphor: "Japanese stationery / handwriting studio: genkō square grid, brush underlines, a vermilion hanko, quiet paper",
    accents: ["rust", "navy-2", "forest"],
  },
  story: "A human craft, carefully productized",
  extraSources: [
    { id: "GR-DISCOVERY-PRD", label: "Tegaki Discovery PRD", ref: "GR/Discovery-PRD.md §1/§3/§5.1", inventory: "§8.9" },
    { id: "GR-BUILD", label: "Tegaki package.json, migrations and tests", ref: "GR/package.json; GR/supabase (18 migrations, RLS); 31 test files; check-claims CI guard", inventory: "§8.9" },
    { id: "GR-SITE", label: "Tegaki live pilot pages", ref: "GR/docs/screenshots/{hero,how-it-works,anatomy,report-excerpt,pricing,sign-in}.jpg", inventory: "§8.9", url: "https://tegaki-one.vercel.app" },
  ],
  hero: {
    tagline: "Two pages. One human reader.",
    proposition:
      "What your handwriting suggests about you — read and written by hand. A D2C pilot that turns a manual handwriting-analysis practice into a product a stranger can order.",
    proofs: [
      { value: "2 pages", label: "of handwriting, photographed or scanned", kind: "prototype", source: "GR-SITE" },
      { value: "1", label: "human reader — no AI in the product", kind: "structural", source: "GR-README" },
      { value: "3", label: "reading depths to choose from", kind: "prototype", source: "GR-SITE", note: "the pilot checkout confirms without charging" },
    ],
    media: {
      src: "/media/case-studies/tegaki/landing.webp",
      alt: "Tegaki's live landing page: “Your handwriting has been talking this whole time.” on vermilion, beside an illustration of a reader holding a handwritten page.",
      width: 1200,
      height: 506,
      frame: "browser",
      provenance: "docs/case-study-sources/tegaki/hero.jpg ← Graphology/docs/screenshots/hero.jpg",
    },
    layout: "stacked",
  },
  sections: [
    {
      kind: "problem",
      id: "problem",
      nav: "Problem",
      eyebrow: "The question",
      headline: "Would a stranger trust — and pay for — a reading by hand?",
      anchors: ["01-context", "02-problem"],
      context:
        "Tushar’s handwriting analysis was a fully manual practice: an analysis, then a polished report. The pilot asks whether that craft can become something a stranger orders, trusts and pays for.",
      flow: {
        caption: "The practice today",
        source: "GR-DISCOVERY-PRD",
        steps: [{ label: "A handwriting sample" }, { label: "Analysed by hand" }, { label: "A polished report", note: "docx / PDF" }],
      },
    },
    {
      kind: "product",
      id: "product",
      nav: "Product",
      eyebrow: "The product",
      headline: "You send. We read. You receive.",
      anchors: ["03-discovery"],
      summary:
        "A buyer signs in, uploads two pages and picks a depth. A person reads the pages and writes a report that names what is visible before what it may suggest.",
      source: "GR-SITE",
      flow: {
        caption: "How it works, from the live site",
        source: "GR-SITE",
        steps: [
          { label: "You send", note: "two pages, photographed or scanned" },
          { label: "We read", note: "a human looks at the patterns" },
          { label: "You receive", note: "a personal report to reflect on" },
        ],
      },
      shots: [
        {
          src: "/media/case-studies/tegaki/anatomy.webp",
          alt: "Tegaki page “Three things on a page, and what they suggest.”: a handwritten note beside “What we notice — the letters lean right” and “What it may suggest”.",
          width: 1000,
          height: 421,
          frame: "browser",
          caption: "What we notice, then what it may suggest",
          provenance: "docs/case-study-sources/tegaki/anatomy.jpg ← Graphology/docs/screenshots/anatomy.jpg",
        },
        {
          src: "/media/case-studies/tegaki/report-excerpt.webp",
          alt: "Tegaki “How it reads.” page with an excerpt from an illustrative sample report for a fictional subject.",
          width: 1000,
          height: 421,
          frame: "browser",
          caption: "A sample report (fictional subject)",
          provenance: "docs/case-study-sources/tegaki/report-excerpt.jpg ← Graphology/docs/screenshots/report-excerpt.jpg",
        },
      ],
    },
    {
      kind: "research",
      id: "insight",
      nav: "Insight",
      eyebrow: "The insight",
      headline: "The operator half is the product.",
      quotes: [
        { text: "The operator half is unspecified (biggest gap)… Turnaround promises live or die in… the admin surface.", attribution: "Tegaki Discovery PRD §5.1", source: "GR-DISCOVERY-PRD" },
      ],
    },
    {
      kind: "decisions",
      id: "decisions",
      nav: "Decisions",
      eyebrow: "Product decisions",
      headline: "A small, honest pilot before a big launch.",
      anchors: ["04-product-bet"],
      items: [
        {
          could: "Generate readings with AI",
          chose: "Keep the reading human",
          because: "The pilot asks whether a stranger would trust this experience; report writing stays manual and offline.",
          source: "GR-README",
        },
        {
          could: "Launch with payments, a domain and email",
          chose: "Pilot first: checkout confirms, charges nothing",
          because: "The first goal is 5–10 pilot users completing the whole loop.",
          source: "GR-SOLUTION-PRD",
        },
        {
          could: "Promise answers about who you are",
          chose: "Indicative readings, guarded in CI",
          because: "“Readings are indicative and growth-oriented, never a diagnosis” — and a CI honesty check guards that line.",
          source: "GR-README",
        },
      ],
    },
    {
      kind: "system",
      id: "system",
      nav: "System",
      eyebrow: "How it works",
      headline: "Private by construction.",
      anchors: ["05-what-i-built"],
      caption: "A handwriting sample’s path through Tegaki",
      source: "GR-BUILD",
      steps: [
        { label: "Google sign-in" },
        { label: "Upload two pages", note: "buyer-scoped storage" },
        { label: "Row-level security", note: "18 database migrations" },
        { label: "A human reads" },
        { label: "Report delivered", note: "signed URL" },
        { label: "Retention job", note: "scheduled clean-up" },
      ],
      rules: [
        "A sample is only visible to its buyer and the analyst.",
        "Sample checks run in the browser, the server action and the database.",
        "Readings are indicative, never a diagnosis.",
      ],
    },
    {
      kind: "outcome",
      id: "evidence",
      nav: "Evidence",
      eyebrow: "Evidence",
      headline: "Live and guarded — still waiting for its first strangers.",
      anchors: ["06-evaluation", "07-outcome", "08-what-i-learned"],
      proofs: [
        { value: "3", label: "layers enforce the sample rules", kind: "structural", source: "GR-README", note: "browser, server action and database CHECK constraints" },
        { value: "18", label: "migrations with row-level security", kind: "structural", source: "GR-BUILD" },
      ],
      gaps: [
        "No pilot users or orders are recorded yet.",
        "The checkout confirms an order without charging for it.",
        "The 5–10-user pilot goal hasn’t been measured.",
      ],
    },
  ],
  evidence: [
    { title: "Discovery PRD", type: "PRD", date: "2026-09-01", supports: "The manual practice, the buyers and the operator-half gap", source: "GR-DISCOVERY-PRD" },
    { title: "Solution PRD", type: "PRD", date: "2026-09-01", supports: "The pilot question and the 5–10-user goal", source: "GR-SOLUTION-PRD" },
    { title: "README", type: "Readme", supports: "No AI in product; guardrails in three layers; never a diagnosis", source: "GR-README" },
    { title: "Build: package, migrations, tests", type: "Code", supports: "18 RLS migrations, 31 test files, the check-claims guard", source: "GR-BUILD" },
    { title: "Live pilot pages", type: "Live data", supports: "How it works, the anatomy page and the sample report", source: "GR-SITE" },
  ],
};
