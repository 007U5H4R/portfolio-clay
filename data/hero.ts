/**
 * Hero copy — taken VERBATIM from CONTENT_INVENTORY.md §1.2 (Home → Hero), each row with its
 * `source` label and honesty `status`. Nothing here is paraphrased. Rows marked `DRAFT` still
 * need Tushar's sign-off (they are composed only from VERIFIED facts); `VERIFIED` rows are quoted
 * or derived directly from a cited artifact.
 *
 * TKT-108 (Tushar 2026-09-26, "change the hero section to this"): the eyebrow, headline, hand line and
 * support are Tushar's own copy, quoted verbatim from his reference image — `VERIFIED` by authorship
 * (the facts they state are the RESUME / AUDIT ones cited in `source`). `tagline` and `tiles` unchanged.
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
  /** Headline split at the reference's three desktop lines (TKT-108); "AI-native products" is the middle one. */
  headline: {
    before: string;
    highlight: string;
    after: string;
    source: string;
    status: CopyStatus;
  };
  /** The Caveat hand line under the h1 (a decorative annotation — `aria-hidden`, Design.md §3.2 rule 6). */
  handLine: { text: string; source: string; status: CopyStatus };
  support: { text: string; source: string; status: CopyStatus };
  tagline: { text: string; source: string; status: CopyStatus };
  tiles: readonly HeroTile[];
}

/** Where TKT-108's copy comes from: Tushar's own hero copy, quoted verbatim from his reference image. */
const TUSHAR_2026_09_26 = "Tushar 2026-09-26, docs/redesign-mockups/m-009/tushar-2026-09-26/hero-copy-target.png (TKT-108)";

export const hero = {
  eyebrow: {
    // Stored in the reference's own casing (it is letter-spaced small caps on the page).
    text: "SENIOR PRODUCT MANAGER · ENTERPRISE AI · AI-NATIVE BUILDER",
    source: `${TUSHAR_2026_09_26}; title per RESUME`,
    status: "VERIFIED",
  },
  headline: {
    // Split at the reference's three desktop lines; the rust underline sits under `after`.
    before: "I turn messy problems into ",
    highlight: "AI-native products",
    after: " people actually use.",
    source: TUSHAR_2026_09_26,
    status: "VERIFIED",
  },
  handLine: {
    text: "Same curiosity. Bigger problems. Better products.",
    source: TUSHAR_2026_09_26,
    status: "VERIFIED",
  },
  support: {
    text:
      "7+ years across product, cloud, data and AI — from enterprise platforms at Godrej, Quantiphi, Shellkode and American Express to independently built AI products tested with real users.",
    source: `${TUSHAR_2026_09_26}; facts per RESUME profile summary / career timeline, AUDIT §4/§5 (TeachSpark, RailCite solo-built) and CS4/docs/final-prd.docx §0/§7 (TeachSpark teacher pilot)`,
    status: "VERIFIED",
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
