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
