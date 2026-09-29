import type { z } from "zod";
import type { CaseStudy } from "../schema";

/**
 * Nuptis → Velora — killing the wrong bet (TASK-130; audit in docs/reports/TASK-130/velora.md).
 * Apparel sourcing and vendor onboarding (not lifestyle). The "portable trust" bet is the PRD's own
 * framing ("trust is unverified and non-portable") and ships as the Trust profile screen — always
 * with its caveat: the scores are authored, never verified. Team research is labelled team research;
 * its "verify before external use" day counts are not shown. No users, no pilot: nothing implies one.
 */
export const veloraCase: z.input<typeof CaseStudy> = {
  slug: "velora",
  theme: {
    key: "velora",
    metaphor: "Sourcing & onboarding dossier: kraft folder, inspection-stamp numerals, swatch tags, a struck first bet",
    accents: ["forest", "terracotta", "kraft"],
  },
  story: "Killing the wrong bet",
  extraSources: [
    { id: "NP-PRD", label: "Nuptis PRD", ref: "CS3/Nuptis-PRD.md:3 / :18 / :201; CS3/Nuptis/docs/screenshots/dashboard.jpg", inventory: "§8.4" },
  ],
  hero: {
    tagline: "Where brands and makers find their fit.",
    proposition:
      "A B2B apparel sourcing marketplace where fashion brands and garment manufacturers swipe to connect, and matches turn into bids — the product that survived killing the first one.",
    proofs: [
      { value: "2", label: "vendor-onboarding products in nine days", kind: "structural", source: "CS3-9DAY-SERIES", note: "Nuptis for wedding agencies, then Velora for apparel — built solo" },
      { value: "Day 7", label: "the first product was killed", kind: "structural", source: "CS3-9DAY-SERIES", note: "“Nine days. Two products. One survived.”" },
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
    layout: "pivot",
  },
  sections: [
    {
      kind: "problem",
      id: "problem",
      nav: "Problem",
      eyebrow: "The onboarding problem",
      headline: "Supplier trust is found by asking around — and it doesn’t travel.",
      anchors: ["01-context", "02-problem"],
      context:
        "An indie apparel founder needs a garment manufacturer; a factory in Tiruppur or Ludhiana needs brands. Today they meet through cold referrals, trade fairs or directories where trust is unverified and non-portable.",
      flow: {
        caption: "How a founder finds a factory today",
        source: "V-PRD",
        steps: [{ label: "Cold referrals" }, { label: "Trade fairs" }, { label: "Directories" }, { label: "Unverified trust" }, { label: "Trust that doesn’t carry over" }],
      },
    },
    {
      kind: "research",
      id: "research",
      nav: "Research",
      eyebrow: "Research (team)",
      headline: "The delay is waiting, not work.",
      anchors: ["03-discovery"],
      intro: "The cohort’s procurement interviews were pooled across the team; Tushar’s own share isn’t separately recorded.",
      quotes: [
        { text: "I find out where a vendor is by asking around.", attribution: "Procurement interview, team PRD", source: "CS3-TEAM-PRD" },
        { text: "We scrutinise new vendors. Changes to old ones, we just… trust.", attribution: "Procurement interview, team PRD", source: "CS3-TEAM-PRD" },
      ],
      insight: {
        text: "Almost none of onboarding is active work — it is idle queue-time between cross-functional handoffs.",
        source: "CS3-TEAM-PRD",
      },
    },
    {
      kind: "pivot",
      id: "pivot",
      nav: "Pivot",
      eyebrow: "The pivot",
      headline: "Kill the first bet on day seven.",
      anchors: ["04-product-bet"],
      from: { name: "Nuptis", line: "Vendor ops for wedding-planning agencies — live and designed, with every success metric defined and none measured." },
      evidence: [
        { text: "“Weddings were blue — but a shallow pool.”", source: "CS3-9DAY-SERIES" },
        { text: "Few events and low willingness to pay: too thin a market to keep building for.", source: "CS3-9DAY-SERIES" },
      ],
      decision: { text: "Keep the trust-and-onboarding insight; aim it at apparel vendor onboarding.", source: "CS3-9DAY-SERIES" },
      to: { name: "Velora", line: "Brands and manufacturers swipe to connect; matches turn into bids. Built in a day." },
    },
    {
      kind: "product",
      id: "portable-trust",
      nav: "The bet",
      eyebrow: "The bet: portable trust",
      headline: "A trust profile a vendor carries into every match.",
      anchors: ["05-what-i-built"],
      summary:
        "Each manufacturer carries one trust profile — a score out of 100 — into discovery, RFPs and bids. In this prototype the scores are authored and shown as if verified; real verification was out of scope.",
      source: "V-PRD",
      shots: [
        {
          src: "/media/case-studies/velora/trust-profile.webp",
          alt: "Velora trust profile for a mock manufacturer, Loomcraft (organic knits and jersey, Tiruppur): a 94 out of 100 score labelled High Trust.",
          width: 540,
          height: 803,
          frame: "phone",
          caption: "Trust profile (authored score)",
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
      kind: "outcome",
      id: "evidence",
      nav: "Evidence",
      eyebrow: "Evidence",
      headline: "A working prototype — not traction.",
      anchors: ["06-evaluation", "07-outcome"],
      intro: "Velora runs live on mock data and was evaluated as a build. There are no users and no pilot.",
      proofs: [
        { value: "10/10", label: "unit tests passing", kind: "measured", asOf: "2026-09-15", source: "V-REVIEW" },
        { value: "0", label: "horizontal overflow at 375 and 768 px", kind: "measured", asOf: "2026-08-11", source: "V-REVIEW", note: "on every route, at the final review" },
        { value: "1 day", label: "to build the live app", kind: "structural", asOf: "2026-08-11", source: "V-README", note: "all 40+ build commits on 11 Aug 2026" },
      ],
      gaps: [
        "No users, no pilot and no usage data.",
        "Trust Scores are authored, not verified against any external source.",
        "The Supabase path was built but never run against a real project.",
      ],
    },
    {
      kind: "learnings",
      id: "learnings",
      nav: "Learnings",
      eyebrow: "What I learned",
      headline: "Nine days. Two products. One survived.",
      anchors: ["08-what-i-learned"],
      items: [
        { title: "Kill without flinching", body: "A blue ocean that is a shallow pool is still the wrong ocean.", source: "CS3-9DAY-SERIES" },
        { title: "Attack the hand-offs", body: "Onboarding delay is queue-time between teams, not any one team working slowly.", source: "V-DISCOVERY-PRD" },
        { title: "Label honestly", body: "Mock data isn’t a proven path, and an authored score isn’t a verified one.", source: "V-PRD" },
      ],
    },
  ],
  evidence: [
    { title: "Velora PRD", type: "PRD", date: "2026-08-10", supports: "The problem, the two sides and authored Trust Scores", source: "V-PRD" },
    { title: "Apparel Discovery PRD", type: "Research", date: "2026-08-12", supports: "H1 (coordination, not effort) and the confidence tags", source: "V-DISCOVERY-PRD" },
    { title: "Case Study 3 team PRD", type: "Research", supports: "Pooled procurement interviews and the queue-time insight", source: "CS3-TEAM-PRD" },
    { title: "Nine-day series", type: "Post", supports: "“Weddings were blue — but a shallow pool.”; the day-seven kill", source: "CS3-9DAY-SERIES" },
    { title: "Nuptis PRD", type: "PRD", date: "2026-08-07", supports: "The first bet and its unmeasured success metrics", source: "NP-PRD" },
    { title: "Velora README", type: "Readme", supports: "The one-day build and the stack", source: "V-README" },
    { title: "Supabase notes", type: "Architecture", supports: "The live path was built but not run against a real project", source: "V-SUPABASE" },
    { title: "Final review (task 6.3)", type: "Evaluation", supports: "10/10 tests, 0 overflow, 156 kB gzip bundle", source: "V-REVIEW" },
    { title: "Velora live app", type: "Live data", date: "2026-09-15", supports: "Live on mock data", source: "V-LIVE" },
  ],
};
