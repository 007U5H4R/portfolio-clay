/**
 * Hero copy — taken VERBATIM from CONTENT_INVENTORY.md §1.2 (Home → Hero), each row with its
 * `source` label and honesty `status`. Nothing here is paraphrased. Rows marked `DRAFT` still
 * need Tushar's sign-off (they are composed only from VERIFIED facts); `VERIFIED` rows are quoted
 * or derived directly from a cited artifact.
 *
 * Kept as a typed literal for the tracer (per technical-plan.md §B S05.03). If a `HeroCopy` zod
 * schema is introduced in TKT-03 this literal migrates into that schema world unchanged.
 */

export type CopyStatus = "VERIFIED" | "DRAFT";

export interface HeroTile {
  /** Short cluster label (AI Products · People · Progress). */
  label: string;
  /** The sourced one-liner shown under the label. */
  copy: string;
  source: string;
  status: CopyStatus;
}

export interface HeroCopy {
  eyebrow: { text: string; source: string; status: CopyStatus };
  /** Headline split so "AI-native products" can render as the accent `.hero-highlight` span. */
  headline: {
    before: string;
    highlight: string;
    after: string;
    source: string;
    status: CopyStatus;
  };
  support: { text: string; source: string; status: CopyStatus };
  tagline: { text: string; source: string; status: CopyStatus };
  tiles: readonly HeroTile[];
}

export const hero = {
  eyebrow: {
    text: "Senior Product Manager · Product Thinker · AI Builder · Problem Solver",
    source: "RESUME (title); positioning per user instruction",
    // §1.2: VERIFIED (title) / DRAFT (supporting triad) — flagged DRAFT for sign-off.
    status: "DRAFT",
  },
  headline: {
    before: "I turn ambiguity into ",
    highlight: "AI-native products",
    after: " people can use.",
    source: "User instruction (fixed copy)",
    status: "DRAFT",
  },
  support: {
    text:
      "7+ years shipping cloud, data and AI products at Godrej Infotech, Quantiphi, Shellkode and American Express — and, since August 2026, a run of solo-built AI products with real users.",
    source:
      "RESUME profile summary; career timeline; AUDIT §4/§5 (TeachSpark/RailCite solo-built, first commits 2026-08-20 / 2026-08-28)",
    status: "DRAFT",
  },
  tagline: {
    text: "Observing what others overlook.",
    source: "PORT \"Tagline: Observing what others overlook.\"",
    status: "VERIFIED",
  },
  tiles: [
    {
      label: "AI Products",
      copy: "TeachSpark · RailCite — two live AI products, built solo, Aug–Sep 2026",
      source: "TS/README.md:3; CS5/Discovery-PRD.md L3-5; AUDIT git table",
      status: "VERIFIED",
    },
    {
      label: "People",
      copy: "17 teachers joined a WhatsApp pilot in its first week (TeachSpark, snapshot 2026-08-24, test handsets excluded)",
      source: "CS4/docs/final-prd.docx §0/§7; DL/Tushar's PRD_ TechSpark.pdf pp.19-21",
      status: "VERIFIED",
    },
    {
      label: "Progress",
      copy: "35+ Accounts Receivable capabilities migrated off a legacy platform; 180+ stories across four Agile teams (AmEx, 2026)",
      source: "RESUME AmEx Key Achievements",
      status: "VERIFIED",
    },
  ],
} as const satisfies HeroCopy;
