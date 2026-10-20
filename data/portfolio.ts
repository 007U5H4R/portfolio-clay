import type { PortfolioEntry } from "./schema";

/**
 * `/projects` Portfolio carousel entries (TASK-116, Tushar's spec 2026-09-28 §5, §14–§15, §19, §21).
 *
 * One entry per PERSONAL build in `data/projects.ts`, in that file's order (the validator enforces
 * the one-to-one match, so a new personal build fails the content gate until it gets an entry here).
 * This file only holds what the carousel needs on top of the project record:
 *   - `code`      the cover's product code ("TS-01"): the product's initials plus its edition,
 *   - `coverLine` the short cover tagline. TeachSpark, RailCite and Cubicle use Tushar's own example
 *                 lines from spec §15; the rest are shortened from each project's `tagline` and add
 *                 no fact the tagline does not state (Campfire Board's is from its README: "renders
 *                 them all through one dashboard … across every project at once"; Slag City's from its
 *                 README header: "Coin-op loop" + "An original arcade beat-'em-up that runs in your browser"),
 *   - `accent`    a paper token name (EVAL-020),
 *   - `pitchVideo` / `demoVideo` / `prdUrl` when they exist. Campfire Board carries the first real pair
 *                 (TASK-124: "Campfire Board launch" / "Campfire Board demo" on YouTube, public and
 *                 embeddable per Tushar 2026-09-28); the rest are uploaded later. Adding one lights up the Pitch / Demo
 *                 actions with no code change — a provider + video id, never embed HTML (video-embed
 *                 spec §2); `title` defaults to "<Name> pitch video" / "<Name> product demonstration":
 *                   pitchVideo: { provider: "youtube", videoId: "<11-char id>" },
 *                   demoVideo:  { provider: "vimeo", videoId: "<numeric id>", title: "…" },
 *                 Using Vimeo for any product adds `player.vimeo.com` to the CSP frame-src at the next
 *                 build (lib/csp.ts); nothing else changes.
 *
 *   - TASK-121 (rectify spec §5.4, §7.3): `meta` is the tiny status line on the info sheet — each is a
 *                 shortening of that project's own `statusLabel` (e.g. TeachSpark's "Live pilot (Twilio
 *                 sandbox) — uptime after 2026-09-09 unverified" → "Live pilot · Twilio sandbox"; the full
 *                 caveat stays on the case study).
 *   - TASK-127 (fidelity spec §4, §10–§12): `coverArt` names each product's hand-authored SVG cover in
 *                 the illustration manifest (`cover-<slug>`, sources in scripts/portfolio-art/scenes/);
 *                 `lettering` and `coverGlyph` (the plate emblem) are its packaging. Velora's cover shows
 *                 apparel sourcing (its record), not beauty.
 *
 *   - TASK-250 (Tushar 2026-10-18): `logo` ({ width, height } of the dark-theme file) marks a product that has its own
 *                 mark/wordmark; it replaces the NAME text on the panel heading and the phone's top bar. The two
 *                 theme files are derived from the slug (`productLogoSrc`, lib/portfolio.ts); provenance in
 *                 public/media/logos/products/README.md. A product without `logo` keeps the text name.
 *
 * Every other product fact (name, proposition, live link, public repo, local demo MP4) is read from
 * `data/projects.ts` by `lib/portfolio.ts`; nothing is repeated here.
 *
 * "Vendor Passport" (named in spec §5) has no record in `data/projects.ts` or in the two source
 * documents, so it is not listed (never invent a product).
 */
export const portfolioEntries: PortfolioEntry[] = [
  { slug: "teachspark", code: "TS-01", coverLine: "AI worksheets for teachers", nextLine: "AI worksheets for teachers", accent: "steel", meta: "Live pilot · Twilio sandbox", coverArt: "cover-teachspark", lettering: "rounded", coverGlyph: "MessageSquareText", logo: { width: 853, height: 134 },
    // Tushar 2026-10-07 (TASK-170): "TeachSpark Launch" https://youtu.be/ub7yB4LwMBM, "TeachSpark Demo" https://youtu.be/vWYbkGFjKyQ (both public).
    pitchVideo: { provider: "youtube", videoId: "ub7yB4LwMBM" },
    demoVideo: { provider: "youtube", videoId: "vWYbkGFjKyQ" } },
  { slug: "railcite", code: "RC-01", coverLine: "Research on track", nextLine: "Research on track", accent: "rust", meta: "Live", coverArt: "cover-railcite", lettering: "slab", coverGlyph: "TrainFront", logo: { width: 580, height: 112 },
    // TASK-125 (Tushar 2026-09-28): YouTube "Railcite" (launch pitch) and "Railcite Demo", channel The Purposeful PM.
    pitchVideo: { provider: "youtube", videoId: "nI3EqDXd5Io" },
    demoVideo: { provider: "youtube", videoId: "B3x-I1J8JW8" } },
  { slug: "velora", code: "VL-01", coverLine: "Vendor onboarding, take two", nextLine: "Vendor onboarding, take two", accent: "forest", meta: "Live · mock data", coverArt: "cover-velora", lettering: "script", coverGlyph: "Shirt", logo: { width: 419, height: 149 },
    // Tushar 2026-10-18 (TASK-246): "Velora Launch v2" (pitch) https://youtu.be/rz1C0hTz1mE,
    // "Velora Demo v2" (demo) https://youtu.be/1BRXGdMqPEs (both public + embeddable).
    pitchVideo: { provider: "youtube", videoId: "rz1C0hTz1mE" },
    demoVideo: { provider: "youtube", videoId: "1BRXGdMqPEs" } },
  { slug: "cubicle", code: "CB-01", coverLine: "Make work less work", nextLine: "Make work less work", accent: "navy-2", meta: "Built · not launched", coverArt: "cover-cubicle", lettering: "block", coverGlyph: "Monitor" },
  { slug: "nuptis", code: "NP-01", coverLine: "Wedding vendor ops", nextLine: "Wedding vendor operations", accent: "terracotta", meta: "Live · mock data", coverArt: "cover-nuptis", lettering: "serif", coverGlyph: "Flower2", logo: { width: 696, height: 174 },
    // Tushar 2026-10-18 (TASK-245): "Nuptis Pitch" (pitch) https://youtu.be/sldcfNeQj94,
    // "Nuptis Demo" (demo) https://youtu.be/1F3UfV_cgW4 (both public + embeddable).
    pitchVideo: { provider: "youtube", videoId: "sldcfNeQj94" },
    demoVideo: { provider: "youtube", videoId: "1F3UfV_cgW4" } },
  { slug: "bhakti-vilas", code: "BV-01", coverLine: "Devotion as wellness", nextLine: "Devotion-led wellbeing", accent: "note", meta: "Live prototype · mock data · team", coverArt: "cover-bhakti-vilas", lettering: "serif", coverGlyph: "Music", logo: { width: 587, height: 123 },
    // Tushar 2026-10-17 (TASK-242): "Bhakti Vilas Launch music" (pitch) https://youtu.be/6-o7uUh-ewY,
    // "Bhakti Vilas Demo music" (demo) https://youtu.be/ytD0nxWMRWU (both public + embeddable).
    pitchVideo: { provider: "youtube", videoId: "6-o7uUh-ewY" },
    demoVideo: { provider: "youtube", videoId: "ytD0nxWMRWU" } },
  { slug: "token-toli", code: "TT-01", coverLine: "Care for parents, from afar", nextLine: "Care for parents, from afar", accent: "green-2", meta: "Discovery only · team PRD", coverArt: "cover-token-toli", lettering: "rounded", coverGlyph: "HeartHandshake" },
  { slug: "pratyasa", code: "PR-01", coverLine: "A patent, on the record", nextLine: "A patent, on the record", accent: "kraft", meta: "Live · patent record", coverArt: "cover-pratyasa", lettering: "mono", coverGlyph: "Microscope", logo: { width: 1200, height: 103 },
    // Tushar 2026-10-07 (TASK-179): "pratyasa launch" (a YouTube Short) https://youtube.com/shorts/xqevuhTxKAQ,
    // "pratyasa demo" https://youtu.be/Rl6MQiSBqh8 (both public).
    pitchVideo: { provider: "youtube", videoId: "xqevuhTxKAQ" },
    demoVideo: { provider: "youtube", videoId: "Rl6MQiSBqh8" } },
  { slug: "tegaki", code: "TG-01", coverLine: "Handwriting, read by hand", nextLine: "Handwriting, read by hand", accent: "rust", meta: "Live pilot", coverArt: "cover-tegaki", lettering: "script", coverGlyph: "Brush" },
  { slug: "dino-arcade-pwa", code: "DA-01", coverLine: "Your phone, an arcade", nextLine: "Your phone, an arcade", accent: "steel", meta: "Live · BYO-ROM", coverArt: "cover-dino-arcade-pwa", lettering: "mono", coverGlyph: "Gamepad2" },
  { slug: "cinematic-portfolio", code: "CP-01", coverLine: "A portfolio, on film", nextLine: "A portfolio, on film", accent: "forest", meta: "Live", coverArt: "cover-cinematic-portfolio", lettering: "slab", coverGlyph: "Clapperboard" },
  {
    slug: "campfire-board",
    code: "CF-01",
    coverLine: "One dashboard, every project", nextLine: "A board for AI agents",
    accent: "terracotta",
    meta: "Built · live demo",
    coverArt: "cover-campfire-board",
    lettering: "script",
    coverGlyph: "Flame", logo: { width: 774, height: 156 },
    pitchVideo: { provider: "youtube", videoId: "K_-510L6e7g" },
    demoVideo: { provider: "youtube", videoId: "DkxDQji3dz8" },
  },
  {
    // TASK-129 (Tushar 2026-09-29): YouTube "slag city launch" (pitch) and "SlagCity demo enhanced" (demo),
    // channel The Purposeful PM, public + embeddable (oEmbed). Live product + public repo come from data/projects.ts.
    slug: "slag-city",
    code: "SC-01",
    coverLine: "Coin-op brawler, in the browser", nextLine: "A 90’s arcade game",
    accent: "rust",
    meta: "Live · browser game",
    coverArt: "cover-slag-city",
    lettering: "block",
    coverGlyph: "Hammer", logo: { width: 351, height: 134 },
    pitchVideo: { provider: "youtube", videoId: "1xvj8j79Svs" },
    demoVideo: { provider: "youtube", videoId: "tc4QDVl8NJM" },
  },
  {
    // TASK-243 (Tushar 2026-10-17): "Shravans Round Launch" (pitch) https://youtu.be/0cYat1u7lJE and
    // "Shravans Round Demo" https://youtu.be/lwXHhCh1NEE, channel The Purposeful PM, public + embeddable.
    slug: "shravans-round",
    code: "SR-01",
    coverLine: "Rehearse the round first", nextLine: "Rehearse the round first",
    accent: "terracotta",
    meta: "Live · team build",
    coverArt: "cover-shravans-round",
    lettering: "rounded",
    coverGlyph: "Mic", logo: { width: 916, height: 134 },
    pitchVideo: { provider: "youtube", videoId: "0cYat1u7lJE" },
    demoVideo: { provider: "youtube", videoId: "lwXHhCh1NEE" },
  },
  {
    // TASK-248 (Tushar 2026-10-18): Urja; the launch and demo films follow (Tushar: "I will share the launch and demo video links tomorrow").
    slug: "urja",
    code: "UR-01",
    coverLine: "Every rupee, accounted for", nextLine: "Truck fleet dashboard",
    accent: "terracotta",
    meta: "Live · simulated fleet",
    coverArt: "cover-urja",
    lettering: "block",
    coverGlyph: "Fuel", logo: { width: 391, height: 124 },
    // Tushar 2026-10-19 (TASK-264): Urja launch (pitch) https://youtu.be/bZbUP3BhXKs, demo https://youtu.be/cDWf1t08lkQ.
    pitchVideo: { provider: "youtube", videoId: "bZbUP3BhXKs" },
    demoVideo: { provider: "youtube", videoId: "cDWf1t08lkQ" },
  },
];
