import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { formatHex, parse, wcagContrast, type Rgb } from "culori";

/**
 * TKT-72 S72.04 / TC-136 step 1 — the band footer's text pairs (Design.md §2.1) computed with culori
 * WCAG contrast from the AUTHORITATIVE hexes in `scripts/tokens-check.ts` and the `color-mix()`
 * percentages actually declared in `app/globals.css` — so a token or percentage change re-runs the
 * math. Thresholds are never lowered (EV2): if a pair fails, fix the colour, not the number.
 *
 * `color-mix(in oklab, <c> N%, transparent)` is <c> at alpha N/100 (the transparent side carries no
 * hue); the browser then composites it over the terracotta band in sRGB — modelled here.
 */
const ROOT = process.cwd();
const TOKENS_SRC = readFileSync(join(ROOT, "scripts/tokens-check.ts"), "utf8");
const CSS = readFileSync(join(ROOT, "app/globals.css"), "utf8");

function authoritative(token: string): string {
  const m = new RegExp(`"--color-${token}":\\s*"(#[0-9A-Fa-f]{6})"`).exec(TOKENS_SRC);
  if (!m?.[1]) throw new Error(`AUTHORITATIVE hex for --color-${token} not found in scripts/tokens-check.ts`);
  return m[1];
}

/** The N in `--<prop>: color-mix(in oklab, var(--color-<token>) N%, transparent)` from globals.css. */
function mixPercent(prop: string, token: string): number {
  const m = new RegExp(`${prop}:\\s*color-mix\\(in oklab, var\\(--color-${token}\\) ([\\d.]+)%, transparent\\)`).exec(CSS);
  if (!m?.[1]) throw new Error(`${prop} is not a color-mix of --color-${token} in app/globals.css`);
  return Number(m[1]) / 100;
}

/** sRGB source-over composite of `fg` at `alpha` onto opaque `bg`. */
function over(fg: string, alpha: number, bg: string): string {
  const f = parse(fg) as Rgb;
  const b = parse(bg) as Rgb;
  const mix = (x: number, y: number) => x * alpha + y * (1 - alpha);
  return formatHex({ mode: "rgb", r: mix(f.r, b.r), g: mix(f.g, b.g), b: mix(f.b, b.b) });
}

const TERRACOTTA = authoritative("terracotta");
const IVORY = authoritative("ivory");
const NOTE = authoritative("note");
const KRAFT = authoritative("kraft");
const ON_BAND_MUTED_ALPHA = mixPercent("--on-band-muted", "ivory");
const ON_BAND_MUTED = over(IVORY, ON_BAND_MUTED_ALPHA, TERRACOTTA);

/** [name, foreground, threshold, where] — the §2.1 band table + the on-band DraftTag (TKT-72 trap). */
const PAIRS: [string, string, number, string][] = [
  ["ivory / terracotta", IVORY, 4.5, "h2 line 1, email, on-band DraftTag text (12 px)"],
  ["kraft / terracotta", KRAFT, 4, "h2 line 2 `.dim` (40–72 px heading, Dev-13)"],
  ["note / terracotta", NOTE, 4.5, "h2 `em`, © bar tagline (Caveat 17 px)"],
  ["--on-band-muted / terracotta", ON_BAND_MUTED, 4.5, "eyebrow, hiring line, labels, © bar"],
];

describe("band contrast pairs (Design.md §2.1, TC-136 step 1)", () => {
  it("reads the authoritative hexes and a muted alpha inside the 70–85 % design range", () => {
    expect(TERRACOTTA.toUpperCase()).toBe("#92381F");
    expect(ON_BAND_MUTED_ALPHA).toBeGreaterThanOrEqual(0.7);
    expect(ON_BAND_MUTED_ALPHA).toBeLessThanOrEqual(0.85);
  });

  for (const [name, fg, min, where] of PAIRS) {
    it(`${name} ≥ ${min}:1 (${where})`, () => {
      const ratio = wcagContrast(fg, TERRACOTTA);
      expect(ratio, `${name} = ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(min);
    });
  }

  it("the on-band DraftTag is ivory, not the default terracotta (which would be 1:1 on the band)", () => {
    expect(wcagContrast(TERRACOTTA, TERRACOTTA)).toBe(1);
    expect(CSS).toMatch(/\.draft-tag-on-band\s*\{[^}]*var\(--on-band\)/);
  });

  it("positive control: the mockup's rgba .65 label alpha would fail 4.5:1", () => {
    expect(wcagContrast(over(IVORY, 0.65, TERRACOTTA), TERRACOTTA)).toBeLessThan(4.5);
  });

  it("worst case on a --band-hatch stripe still clears WCAG AA (4.5 text, 3 large heading)", () => {
    const hatch = /--band-hatch:[^;]*color-mix\(in oklab, var\(--color-ivory\) ([\d.]+)%, transparent\)/.exec(CSS);
    expect(hatch?.[1], "--band-hatch ivory percentage").toBeDefined();
    const stripe = over(IVORY, Number(hatch![1]) / 100, TERRACOTTA);
    const onStripe = (fg: string) => (fg === ON_BAND_MUTED ? over(IVORY, ON_BAND_MUTED_ALPHA, stripe) : fg);
    for (const [name, fg, min] of PAIRS) {
      const aa = min === 4 ? 3 : 4.5;
      expect(wcagContrast(onStripe(fg), stripe), `${name} on a hatch stripe`).toBeGreaterThanOrEqual(aa);
    }
  });
});

/**
 * TKT-90c · S90.02 / TC-174 step 3 — every text/background pair the Phase A/B/C tickets put on the page,
 * enumerated from their reports and Design.md §2.1 / §11 (Dev-13, Dev-29, Dev-35, Dev-36) and cross-checked
 * against a rendered-pair probe of every route at 390 + 1440 (docs/reports/TKT-90-90c.md). Each row names
 * one `app/globals.css` rule that really declares the foreground on that surface — the test fails if the
 * rule stops declaring that colour, so the table cannot silently drift from the CSS.
 *
 * Thresholds (WCAG 2.x AA, never lowered — EV2): 4.5 for text, 3 for large text (≥ 24 px, or ≥ 18.66 px
 * at weight ≥ 700 — axe's definition; 600 is NOT bold for this rule).
 */
const T = {
  paper: authoritative("paper"),
  ivory: IVORY,
  paper2: authoritative("paper-2"),
  navy: authoritative("navy"),
  navy2: authoritative("navy-2"),
  inkSoft: authoritative("ink-soft"),
  rust: authoritative("rust"),
  terracotta: TERRACOTTA,
  forest: authoritative("forest"),
  green2: authoritative("green-2"),
  steel: authoritative("steel"),
  note: NOTE,
  kraft: KRAFT,
} as const;
type Tok = keyof typeof T;
const CSS_NAME: Record<Tok, string> = {
  paper: "paper", ivory: "ivory", paper2: "paper-2", navy: "navy", navy2: "navy-2", inkSoft: "ink-soft",
  rust: "rust", terracotta: "terracotta", forest: "forest", green2: "green-2", steel: "steel", note: "note", kraft: "kraft",
};

/** The declaration block of the first rule whose selector list is exactly `selector` (comments stripped). */
function ruleBody(selector: string): string {
  const css = CSS.replace(/\/\*[\s\S]*?\*\//g, "");
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
  const m = new RegExp(`(?:^|[}\\s;])${esc}\\s*\\{([^{}]*)\\}`, "m").exec(css);
  if (!m?.[1]) throw new Error(`rule "${selector}" not found in app/globals.css`);
  return m[1];
}

type Size = "text" | "large";
/**
 * Evidence that the fg colour is really used: a `globals.css` selector whose rule declares
 * `color: var(--color-<fg>)`, or `src:<file>` for a Tailwind utility (`text-<fg>`) in that component.
 */
function assertEvidence(evidence: string, fg: string) {
  if (evidence.startsWith("src:")) {
    const src = readFileSync(join(ROOT, evidence.slice(4)), "utf8");
    expect(src, `${evidence} must still use text-${fg}`).toMatch(new RegExp(`(?<![-\\w])text-${fg}(?![-\\w])`));
    return;
  }
  expect(ruleBody(evidence), `${evidence} must still declare color: var(--color-${fg})`).toMatch(
    new RegExp(`(?<![-\\w])color:\\s*var\\(--color-${fg}\\)`),
  );
}

/** [foreground, background, size class, evidence (see assertEvidence), where it renders] */
const USED_PAIRS: [Tok, Tok, Size, string, string][] = [
  // Body + headings (≥ 7:1 by design): navy / navy-2 on every paper surface
  ["navy", "paper", "text", ".hit-h3", "home how-I-think, essay prose, chapter bodies"],
  ["navy", "paper2", "text", ".learned-list li", "case-study What I learned, featured/ask sections"],
  ["navy", "ivory", "text", ".cs-notebook p", "overview notebook, work cards, buttons"],
  ["navy", "note", "text", ".artifact-hyp .artifact-text", "hypothesis sticky, about quote sheet"],
  ["navy", "kraft", "text", ".pg-ex-live", "kraft doc tag / media tag text (Dev-13, Dev-29), Cinematic kraft card link"],
  ["navy2", "paper", "text", ".hit-principle", "leads, eyebrows, tagline"],
  ["navy2", "paper2", "text", ".sources-list", "sources, essay deks, index taglines"],
  ["navy2", "ivory", "text", ".work-card-tagline", "card taglines, structural kind badges (Dev-29)"],
  ["navy2", "kraft", "text", ".pg-board .pg-ex-2 .pg-ex-num", "Tegaki numeral on kraft (Dev-36; terracotta failed)"],
  // Secondary (≥ 4.5)
  ["inkSoft", "paper", "text", ".essay-meta", "captions, meta, sources markers"],
  ["inkSoft", "paper2", "text", ".learned-help", "help lines, essay numerals, asOf"],
  ["inkSoft", "ivory", "text", ".work-metric-asof", "card asOf, metric labels"],
  ["inkSoft", "note", "text", "src:components/case-study/artifacts/SourceCaption.tsx", "artifact source caption on the hypothesis sticky, 12 px (4.52 — thinnest margin on the site)"],
  ["green2", "paper", "text", ".job-tags", "experience-strip tags (12 px micro)"],
  ["green2", "paper2", "text", ".work-tags", "/projects index kickers/tags (12 px micro; moved from /work, TKT-101)"],
  ["green2", "ivory", "text", ".work-kicker", "featured card kicker, story dl dt"],
  ["forest", "paper", "text", ".aj-range", "about journey ranges (12 px)"],
  ["forest", "paper2", "text", ".artifact-eval dt", "evaluation labels (Dev-29; steel failed at 3.59)"],
  ["forest", "ivory", "text", ".aimp-kind[data-kind=\"measured\"]", "measured badges, zero metrics"],
  ["terracotta", "paper2", "text", ".sources-list a[data-inline-link]", "Sources links (TKT-82), second-opener CTA (TKT-80)"],
  ["terracotta", "ivory", "text", ".aimp-kind[data-kind=\"self-reported\"]", "self-reported badges, band social glyphs"],
  ["terracotta", "note", "text", ".artifact-lbl", "hypothesis label on the sticky"],
  ["terracotta", "paper", "text", ".essay-related:hover", "hover deepening on paper"],
  ["terracotta", "paper", "text", "src:components/paper/DraftTag.tsx", "DraftTag, 12 px / 600 on paper"],
  ["terracotta", "ivory", "text", "src:components/paper/DraftTag.tsx", "DraftTag on an ivory card"],
  ["terracotta", "note", "text", "src:components/paper/DraftTag.tsx", "DraftTag on a note sheet (/about)"],
  // Rust as text: ≥ 4.5 only on paper/ivory (Design §2.1 reserves it for ≥ 17 px or bold anyway)
  ["rust", "paper", "text", ".node-src", "thinking-node source link, 13 px / 600 (TKT-83)"],
  ["rust", "ivory", "text", ".work-card-cta", "work-card CTA and kicker status on the card sheet"],
  // Rust on paper-2 only as LARGE text (4.3:1 fails 4.5)
  ["rust", "paper2", "large", ".work-num", "/projects row numerals at 24 px (TKT-80; moved from /work, TKT-101)"],
  ["rust", "paper2", "large", ".contact-hand-line", "contact hand line, 32–46 px"],
  // Terracotta on kraft only as LARGE text (4.16:1)
  ["terracotta", "kraft", "large", ".proof-award b", "award years, Fraunces 30 px on the kraft tag (Dev-35)"],
  // Inverse surfaces
  ["ivory", "rust", "text", ".hero-btn-primary", "primary buttons (hero, contact), 22 px / 600"],
  ["paper", "rust", "text", "src:app/not-found.tsx", "404 \"Back home\" button, 22 px / 600 (not large for axe: < 24 px and < 700)"],
  ["ivory", "navy", "text", ".header-pill", "nav pill, Ask submit, next-project band"],
  ["kraft", "navy", "text", ".cs-next-eyebrow", "next-project eyebrow (12 px) and note"],
];

describe("used text/background pairs — Phase A/B/C (TC-174 step 3)", () => {
  for (const [fg, bg, size, selector, where] of USED_PAIRS) {
    const min = size === "large" ? 3 : 4.5;
    it(`${CSS_NAME[fg]} on ${CSS_NAME[bg]} ≥ ${min}:1 — ${where}`, () => {
      const ratio = wcagContrast(T[fg], T[bg]);
      expect(ratio, `${CSS_NAME[fg]}/${CSS_NAME[bg]} = ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(min);
      assertEvidence(selector, CSS_NAME[fg]);
    });
  }

  it("large-text rows really are large (≥ 24 px, or a clamp whose floor is ≥ 24 px)", () => {
    for (const [, , size, selector] of USED_PAIRS) {
      if (size !== "large" || selector.startsWith("src:")) continue;
      const fs = /font-size:\s*([^;]+);/.exec(ruleBody(selector))?.[1] ?? "";
      const floor = parseFloat(/clamp\(\s*([\d.]+)px/.exec(fs)?.[1] ?? fs);
      expect(floor, `${selector} font-size ${fs}`).toBeGreaterThanOrEqual(24);
    }
  });

  it("navy on the artifact status chip (ivory 55 % over the note sticky) ≥ 4.5:1", () => {
    const body = ruleBody(".artifact-status");
    const alpha = Number(/background:\s*color-mix\(in oklab, var\(--color-ivory\) ([\d.]+)%, transparent\)/.exec(body)?.[1]) / 100;
    expect(alpha).toBeGreaterThan(0);
    expect(body).toMatch(/(?<![-\w])color:\s*var\(--color-navy\)/);
    expect(wcagContrast(T.navy, over(T.ivory, alpha, T.note))).toBeGreaterThanOrEqual(4.5);
  });

  // Negative controls — the corrected mockup pairs really fail, so the corrections above are load-bearing.
  it.each([
    ["rust", "paper2", 4.5, "Sources link / second-opener CTA would fail as normal text (TKT-80/82)"],
    ["steel", "paper2", 4.5, "evaluation dt in the mockup's steel (Dev-29)"],
    ["steel", "ivory", 4.5, "structural badge text in steel (Dev-29, TKT-86)"],
    ["terracotta", "kraft", 4.5, "Tegaki numeral / kraft doc-tag text in terracotta (Dev-36, Dev-29)"],
    ["rust", "kraft", 3, "award years in rust fail even as large text (Dev-35)"],
  ] as [Tok, Tok, number, string][])("control: %s on %s < %s:1 (%s)", (fg, bg, min) => {
    expect(wcagContrast(T[fg], T[bg])).toBeLessThan(min);
  });
});
