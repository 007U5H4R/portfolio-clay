import type { z } from "zod";
import type { CaseStudy } from "../schema";

/**
 * Nuptis → Velora — nine days, two products, one survived (TASK-130; audit in
 * docs/reports/TASK-130/velora.md). Journal layout (Tushar's redesign brief, 2026-09-29): the pivot
 * is the centrepiece. Apparel sourcing and vendor onboarding (not lifestyle). The "portable trust"
 * bet is the PRD's own framing ("trust is unverified and non-portable") and ships as the Trust profile
 * screen — always labelled as authored prototype data, never verified. Team research is labelled team
 * research; its day counts appear only as team secondary research marked "verify before external
 * use", never as Velora's data. When Velora was built inside the nine days isn't recorded beyond
 * "killed on day seven … nine days", so the card says "by day 9". No users, no pilot.
 */
export const veloraCase: z.input<typeof CaseStudy> = {
  slug: "velora",
  layout: "journal",
  theme: {
    key: "velora",
    metaphor: "A fashion sourcing studio: linen moodboard, fabric swatches, garment tags, a stitched rail, sample-tag markers, the struck first concept",
    accents: ["forest", "terracotta", "kraft"],
  },
  story: "Nine days. Two products. One survived.",
  extraSources: [
    { id: "NP-PRD", label: "Nuptis PRD", ref: "CS3/Nuptis-PRD.md:3 / :18 / :201; CS3/Nuptis/docs/screenshots/dashboard.jpg", inventory: "§8.4" },
  ],
  hero: {
    tagline: "Where brands and makers find their fit.",
    proposition: "A B2B apparel sourcing marketplace where brands and manufacturers match, then turn matches into bids.",
    beats: ["Nine days.", "Two products.", "One survived."],
    notes: ["Kill without flinching.", "Keep the insight. Kill the bet.", "Portable trust."],
    proofs: [
      { value: "2", label: "products", kind: "structural", source: "CS3-9DAY-SERIES", note: "Nuptis, then Velora — nine days, solo" },
      { value: "Day 7", label: "first product killed", kind: "structural", source: "CS3-9DAY-SERIES" },
      { value: "1 day", label: "to build Velora", kind: "structural", asOf: "2026-08-11", source: "V-README" },
    ],
    media: {
      src: "/media/case-studies/velora/role-select.webp",
      alt: "Velora's first screen on a phone: “Where brands and makers find their fit. Trust-first apparel sourcing — swipe, match, bid.” with an “I'm a Brand” card.",
      width: 540,
      height: 803,
      frame: "phone",
      provenance: "docs/case-study-sources/velora/role-select.jpg ← Case Study 3/Velora/docs/screenshots/role-select.jpg",
    },
    pivotFrom: {
      src: "/media/case-studies/velora/nuptis-dashboard.webp",
      alt: "The killed first product, Nuptis: a vendor roster dashboard for a wedding-planning agency, with mock vendors, risk tiers and compliance status.",
      width: 1000,
      height: 421,
      frame: "browser",
      provenance: "docs/case-study-sources/nuptis/dashboard.jpg ← Case Study 3/Nuptis/docs/screenshots/dashboard.jpg",
    },
    scene: { src: "/media/case-studies/velora/hero-studio.svg", width: 1200, height: 960 },
    layout: "pivot",
  },
  sections: [
    {
      kind: "problem",
      id: "problem",
      nav: "Problem",
      eyebrow: "The problem",
      headline: "Supplier trust is found by asking around — and it doesn’t travel.",
      anchors: ["01-context", "02-problem"],
      context: "An indie apparel brand needs a garment maker; a factory in Tiruppur or Ludhiana needs brands.",
      flow: {
        caption: "How a brand finds a factory today",
        source: "V-PRD",
        steps: [{ label: "Cold referrals" }, { label: "Trade fairs" }, { label: "Directories" }, { label: "Unverified trust" }, { label: "Trust that doesn’t travel" }],
      },
    },
    {
      kind: "research",
      id: "research",
      nav: "Insight",
      eyebrow: "Research (team)",
      headline: "The delay is waiting, not work.",
      anchors: ["03-discovery"],
      intro: "Procurement interviews were pooled across the Case Study 3 team.",
      timeline: {
        active: "Active work · under 10%",
        waiting: "Waiting between hand-offs",
        figure: "15–30 business days",
        note: "Team secondary research, marked “verify before external use” — shown as background, never as Velora’s data.",
        source: "CS3-TEAM-PRD",
      },
      quotes: [
        { text: "I find out where a vendor is by asking around.", attribution: "Procurement interview, team PRD", source: "CS3-TEAM-PRD" },
        { text: "We scrutinise new vendors. Changes to old ones, we just… trust.", attribution: "Procurement interview, team PRD", source: "CS3-TEAM-PRD" },
      ],
    },
    {
      kind: "pivot",
      id: "pivot",
      nav: "Pivot",
      eyebrow: "The pivot",
      headline: "Kill the first bet on day seven.",
      anchors: ["04-product-bet"],
      from: { name: "Nuptis", line: "Vendor ops for wedding-planning agencies — live, with every success metric defined and none measured.", when: "Days 1–7" },
      evidence: [{ text: "“Weddings were blue — but a shallow pool.” Few events, low willingness to pay.", source: "CS3-9DAY-SERIES" }],
      decision: { text: "Keep the trust-and-onboarding insight; aim it at apparel sourcing.", source: "CS3-9DAY-SERIES" },
      to: { name: "Velora", line: "Brands and manufacturers match; matches turn into bids. Built in a day.", when: "By day 9" },
      stamp: "Day 7 · killed",
    },
    {
      kind: "product",
      id: "portable-trust",
      nav: "The bet",
      eyebrow: "The bet",
      headline: "Portable trust.",
      anchors: ["05-what-i-built"],
      summary: "One trust profile a manufacturer carries into every match, RFP and bid. The scores are authored prototype data — verification was out of scope.",
      source: "V-PRD",
      flow: {
        caption: "Brand ↔ manufacturer",
        source: "V-PRD",
        steps: [{ label: "Match" }, { label: "RFP" }, { label: "Bid" }],
      },
      shots: [
        {
          src: "/media/case-studies/velora/trust-profile.webp",
          alt: "Velora trust profile for a mock manufacturer, Loomcraft (organic knits and jersey, Tiruppur): a 94 out of 100 score labelled High Trust.",
          width: 540,
          height: 803,
          frame: "phone",
          caption: "Trust profile",
          provenance: "docs/case-study-sources/velora/trust-profile.jpg ← Case Study 3/Velora/docs/screenshots/trust-profile.jpg",
        },
        {
          src: "/media/case-studies/velora/rfps.webp",
          alt: "Velora “Your RFPs” screen listing two live mock requests, Organic Cotton Tees and Linen Shirt Run, with units, budget and ship-by dates.",
          width: 540,
          height: 803,
          frame: "phone",
          caption: "A brand’s RFPs",
          provenance: "docs/case-study-sources/velora/rfps.jpg ← Case Study 3/Velora/docs/screenshots/rfps.jpg",
        },
        {
          src: "/media/case-studies/velora/bids.webp",
          alt: "Velora “Bids received” screen: mock manufacturer bids on an Organic Cotton Tees RFP, sorted by best match, each with price per unit, lead time and trust score.",
          width: 540,
          height: 803,
          frame: "phone",
          caption: "Bids, sorted by best match",
          provenance: "docs/case-study-sources/velora/bids.jpg ← Case Study 3/Velora/docs/screenshots/bids.jpg",
        },
      ],
    },
    {
      kind: "learnings",
      id: "learnings",
      nav: "Learnings",
      eyebrow: "Key learnings",
      headline: "Nine days. Two products. One survived.",
      anchors: ["08-what-i-learned"],
      items: [
        { title: "Kill without flinching", body: "A blue ocean that is a shallow pool is still the wrong ocean.", source: "CS3-9DAY-SERIES" },
        { title: "Attack the hand-offs", body: "Onboarding delay is queue-time between teams, not any one team working slowly.", source: "V-DISCOVERY-PRD" },
        { title: "Label honestly", body: "Mock data isn’t a proven path, and an authored score isn’t a verified one.", source: "V-PRD" },
      ],
    },
    {
      kind: "outcome",
      id: "evidence",
      nav: "Evidence",
      eyebrow: "Evidence",
      headline: "A working prototype — not traction.",
      anchors: ["06-evaluation", "07-outcome"],
      proofs: [
        { value: "10/10", label: "unit tests passing", kind: "measured", asOf: "2026-09-15", source: "V-REVIEW" },
        { value: "0", label: "horizontal overflow", kind: "measured", asOf: "2026-08-11", source: "V-REVIEW", note: "every route, at 375 and 768 px" },
        { value: "1 day", label: "build time", kind: "structural", asOf: "2026-08-11", source: "V-README", note: "all 40+ build commits on 11 Aug 2026" },
      ],
      gaps: ["Real users", "A real pilot", "Usage data", "A verified trust score"],
      stamp: ["Mock data"],
    },
  ],
  evidence: [
    { title: "Velora PRD", type: "PRD", date: "2026-08-10", supports: "The problem, the two sides and authored Trust Scores", source: "V-PRD" },
    { title: "Apparel Discovery PRD", type: "Research", date: "2026-08-12", supports: "H1 (coordination, not effort) and the confidence tags", source: "V-DISCOVERY-PRD" },
    { title: "Case Study 3 team PRD", type: "Research", supports: "Pooled procurement interviews; the queue-time insight and its unverified day counts", source: "CS3-TEAM-PRD" },
    { title: "Nine-day series", type: "Post", supports: "“Weddings were blue — but a shallow pool.”; the day-seven kill", source: "CS3-9DAY-SERIES" },
    { title: "Nuptis PRD", type: "PRD", date: "2026-08-07", supports: "The first bet and its unmeasured success metrics", source: "NP-PRD" },
    { title: "Velora README", type: "Readme", supports: "The one-day build and the stack", source: "V-README" },
    { title: "Supabase notes", type: "Architecture", supports: "The live path was built but not run against a real project", source: "V-SUPABASE" },
    { title: "Final review (task 6.3)", type: "Evaluation", supports: "10/10 tests, 0 overflow, 156 kB gzip bundle", source: "V-REVIEW" },
    { title: "Velora live app", type: "Live data", date: "2026-09-15", supports: "Live on mock data", source: "V-LIVE" },
  ],
};
