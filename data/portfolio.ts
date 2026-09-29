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
 * Every other product fact (name, proposition, live link, public repo, local demo MP4) is read from
 * `data/projects.ts` by `lib/portfolio.ts`; nothing is repeated here.
 *
 * "Vendor Passport" (named in spec §5) has no record in `data/projects.ts` or in the two source
 * documents, so it is not listed (never invent a product).
 */
export const portfolioEntries: PortfolioEntry[] = [
  { slug: "teachspark", code: "TS-01", coverLine: "AI worksheets for teachers", accent: "steel", meta: "Live pilot · Twilio sandbox", coverArt: "cover-teachspark", lettering: "rounded", coverGlyph: "MessageSquareText" },
  { slug: "railcite", code: "RC-01", coverLine: "Research on track", accent: "rust", meta: "Live", coverArt: "cover-railcite", lettering: "slab", coverGlyph: "TrainFront",
    // TASK-125 (Tushar 2026-09-28): YouTube "Railcite" (launch pitch) and "Railcite Demo", channel The Purposeful PM.
    pitchVideo: { provider: "youtube", videoId: "nI3EqDXd5Io" },
    demoVideo: { provider: "youtube", videoId: "B3x-I1J8JW8" } },
  { slug: "velora", code: "VL-01", coverLine: "Vendor onboarding, take two", accent: "forest", meta: "Live · mock data", coverArt: "cover-velora", lettering: "script", coverGlyph: "Shirt" },
  { slug: "cubicle", code: "CB-01", coverLine: "Make work less work", accent: "navy-2", meta: "Built · not launched", coverArt: "cover-cubicle", lettering: "block", coverGlyph: "Monitor" },
  { slug: "nuptis", code: "NP-01", coverLine: "Wedding vendor ops", accent: "terracotta", meta: "Live · mock data", coverArt: "cover-nuptis", lettering: "serif", coverGlyph: "Flower2" },
  { slug: "bhakti-vilas", code: "BV-01", coverLine: "Devotion as wellness", accent: "note", meta: "Live prototype · mock data · team", coverArt: "cover-bhakti-vilas", lettering: "serif", coverGlyph: "Music" },
  { slug: "token-toli", code: "TT-01", coverLine: "Care for parents, from afar", accent: "green-2", meta: "Discovery only · team PRD", coverArt: "cover-token-toli", lettering: "rounded", coverGlyph: "HeartHandshake" },
  { slug: "pratyasa", code: "PR-01", coverLine: "A patent, on the record", accent: "kraft", meta: "Live · patent record", coverArt: "cover-pratyasa", lettering: "mono", coverGlyph: "Microscope" },
  { slug: "tegaki", code: "TG-01", coverLine: "Handwriting, read by hand", accent: "rust", meta: "Live pilot", coverArt: "cover-tegaki", lettering: "script", coverGlyph: "Brush" },
  { slug: "dino-arcade-pwa", code: "DA-01", coverLine: "Your phone, an arcade", accent: "steel", meta: "Live · BYO-ROM", coverArt: "cover-dino-arcade-pwa", lettering: "mono", coverGlyph: "Gamepad2" },
  { slug: "cinematic-portfolio", code: "CP-01", coverLine: "A portfolio, on film", accent: "forest", meta: "Live", coverArt: "cover-cinematic-portfolio", lettering: "slab", coverGlyph: "Clapperboard" },
  {
    slug: "campfire-board",
    code: "CF-01",
    coverLine: "One dashboard, every project",
    accent: "terracotta",
    meta: "Built · local tool",
    coverArt: "cover-campfire-board",
    lettering: "script",
    coverGlyph: "Flame",
    pitchVideo: { provider: "youtube", videoId: "K_-510L6e7g" },
    demoVideo: { provider: "youtube", videoId: "DkxDQji3dz8" },
  },
  {
    // TASK-129 (Tushar 2026-09-29): YouTube "slag city launch" (pitch) and "SlagCity demo enhanced" (demo),
    // channel The Purposeful PM, public + embeddable (oEmbed). Live product + public repo come from data/projects.ts.
    slug: "slag-city",
    code: "SC-01",
    coverLine: "Coin-op brawler, in the browser",
    accent: "rust",
    meta: "Live · browser game",
    coverArt: "cover-slag-city",
    lettering: "block",
    coverGlyph: "Hammer",
    pitchVideo: { provider: "youtube", videoId: "1xvj8j79Svs" },
    demoVideo: { provider: "youtube", videoId: "tc4QDVl8NJM" },
  },
];
