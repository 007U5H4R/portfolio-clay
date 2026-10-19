import type { z } from "zod";
import type { CaseStudy } from "../schema";

/**
 * Urja — an AI munshi for Indian fleet owners (TASK-248). A solo concept on a simulated 24-truck fleet
 * (Sharma Roadlines, Jaipur, fictional): every name and rupee in the captures is simulated, and the captions
 * say so. Rules raise every flag; only Ask Urja calls a model, and its eval gate failed on the Gemini
 * free-tier quota, so the page says so instead of claiming a pass. Urja's own wording rule holds here too:
 * "unaccounted" or "doesn't add up", never "theft". No users or outcomes are recorded, so none are claimed.
 * The hero plays the launch film over the Today capture as its poster (TASK-264, Tushar 2026-10-19).
 */
export const urjaCase: z.input<typeof CaseStudy> = {
  slug: "urja",
  theme: {
    key: "urja",
    metaphor: "Lamplight on a night highway: a near-black warm ground, amber lamp light, a red figure only where the money doesn't add up",
    accents: ["terracotta", "note", "navy-2"],
  },
  story: "Every rupee, accounted for",
  extraSources: [
    { id: "URJA-CAPTURES", label: "Urja live captures", ref: "urja-three.vercel.app /, /trips/0926-04 and /brief (captured 2026-10-18)", inventory: "§8.15" },
  ],
  hero: {
    tagline: "The trip is done. Where did the money go?",
    proposition:
      "An AI munshi for small fleet owners: it reconciles each trip's diesel, tolls and km, and every morning tells the owner, in Hindi or English, which rupees don't add up and how sure it is.",
    proofs: [
      { value: "5 rules", label: "raise every flag, each with a confidence level", kind: "structural", source: "URJA-PRD" },
      { value: "2 of 23", label: "flags wrong in the simulated month, shown to the owner", kind: "structural", note: "The false-accusation guardrail is under 10%, and the product shows it as “When Urja was wrong”.", source: "URJA-DEC" },
    ],
    media: {
      video: "pitch",
      poster: {
        src: "/media/case-studies/urja/today.webp",
        alt: "Urja's Today screen for a simulated fleet: “Your trucks earned ₹1,86,400 yesterday. ₹11,430 of it doesn't add up, across 3 trips.”, a night-highway truck reconstruction and three flagged trips.",
        width: 1400,
        height: 875,
        frame: "browser",
        provenance: "docs/case-study-sources/urja/today-desktop.jpg ← live capture of urja-three.vercel.app (simulated fleet)",
      },
    },
    layout: "split",
  },
  sections: [
    {
      kind: "problem",
      id: "why",
      nav: "Why",
      eyebrow: "Why it exists",
      headline: "Diesel is the biggest cost, and the owner only sees it after the trip.",
      anchors: ["01-context", "02-problem", "03-discovery"],
      context:
        "Owners of 10–100 trucks run the business from a phone and WhatsApp. Fuel is the largest operating cost, and vendor sources claim a large share of it leaks — directional figures, not proven ones. The owner's question is simpler: why did a finished trip make almost nothing?",
      quote: { text: "The truck finished the trip — why did I make almost nothing?", attribution: "The owner's question, Urja Discovery PRD", source: "URJA-DISC" },
    },
    {
      kind: "product",
      id: "product",
      nav: "Product",
      eyebrow: "The morning",
      headline: "Read the brief, open the evidence, ask the driver.",
      anchors: ["05-what-i-built"],
      summary:
        "A morning brief in Hindi or English names the trips that don't add up. Each flag opens its evidence — the route, the fuel curve and what the truck recorded — with a confidence level and the driver's side, and nothing is deducted until the owner decides.",
      source: "URJA-PRD",
      shots: [
        {
          src: "/media/case-studies/urja/trip.webp",
          alt: "A simulated trip's evidence page: Jaipur to Delhi on NH48, a map with the stop near Behror marked, “38 L diesel unaccounted, ₹3,420”, high confidence, what the truck recorded, and a button to ask the driver on WhatsApp.",
          width: 1400,
          height: 875,
          frame: "browser",
          caption: "One flag's evidence (simulated fleet)",
          provenance: "docs/case-study-sources/urja/trip-desktop.jpg ← live capture of /trips/0926-04",
        },
        {
          src: "/media/case-studies/urja/brief-hi.webp",
          alt: "The morning brief in Hindi on a phone-width page: yesterday's earnings of ₹1,86,400, a 14-day bar chart, and three trips to look at.",
          width: 420,
          height: 875,
          frame: "phone",
          caption: "The morning brief, in Hindi",
          provenance: "docs/case-study-sources/urja/brief-desktop.jpg ← live capture of /brief, cropped to the page column",
        },
      ],
    },
    {
      kind: "decisions",
      id: "decisions",
      nav: "Decisions",
      eyebrow: "Decisions",
      headline: "Rules find the money; the model only answers questions.",
      anchors: ["04-product-bet"],
      items: [
        { could: "A broad telemetry dashboard", chose: "One problem, found and explained", because: "Building is the cheap part; the work is finding the right problem for one owner.", source: "URJA-DEC" },
        { could: "Let a model find the leaks", chose: "Deterministic rules, with a live model only in Ask Urja", because: "A fully live design risked invented rupee figures and a fragile demo; rules make every figure explainable.", source: "URJA-DEC" },
        { could: "Measure engagement", chose: "₹ recovered per truck, guarded by the false-accusation rate", because: "A flag that wrongly accuses a driver costs trust, so every flag shows its confidence and the driver's side.", source: "URJA-DEC" },
      ],
    },
    {
      kind: "system",
      id: "system",
      nav: "System",
      eyebrow: "How it works",
      headline: "From the truck's data to the owner's morning.",
      caption: "One trip through Urja",
      source: "URJA-PRD",
      steps: [
        { label: "Trip data", note: "fuel sensor, GPS, tolls, bills" },
        { label: "Five rules", note: "fuel drop, refuel, km/L, route, toll" },
        { label: "Confidence", note: "high, likely or check" },
        { label: "Morning brief", note: "templated, Hindi or English" },
        { label: "Ask Urja", note: "Gemini, with a labelled fallback" },
      ],
      rules: ["Low-confidence flags say “Check”, never an accusation.", "Next.js on Vercel; three.js for the night reconstruction, MapLibre for the route."],
    },
    {
      kind: "outcome",
      id: "evidence",
      nav: "Evidence",
      eyebrow: "Evidence",
      headline: "Live on a simulated fleet — no users yet.",
      anchors: ["06-evaluation", "07-outcome", "08-what-i-learned"],
      intro:
        "Urja runs live on a fictional 24-truck fleet. 1,235 unit and 515 end-to-end tests passed and the security review found nothing. The Ask Urja eval did not pass: the final run hit the model's free-tier quota, so the live Ask box usually shows its fallback answer.",
      gaps: ["No owners, trips or recoveries from a real fleet are recorded.", "The Ask Urja eval gate is recorded as failed.", "The Hindi copy has not had a native-speaker review."],
    },
  ],
  evidence: [
    { title: "Discovery PRD", type: "Research", date: "2026-09-28", supports: "The owner, the problem and the pain signals", source: "URJA-DISC" },
    { title: "Solution PRD", type: "PRD", date: "2026-09-28", supports: "The screens, the five rules and the AI design", source: "URJA-PRD" },
    { title: "Decision log", type: "Design", date: "2026-09-28", supports: "Problem-first scope, rules over a live model, the guardrail", source: "URJA-DEC" },
    { title: "QA report and Ask eval", type: "Evaluation", date: "2026-10-05", supports: "Test results, the security review and the failed eval gate", source: "URJA-QA" },
    { title: "Live captures", type: "Live data", date: "2026-10-18", supports: "The screens shown here", source: "URJA-CAPTURES" },
  ],
};
