/**
 * tokens-check.ts (D2) — OKLCH regeneration guard.
 *
 * The authoritative colour source is the 13 paper hex values in Design.md §2.1 (mirrored
 * below; S12/D2 — the clay set in DESIGN_DIRECTION.md §2 is retired). `app/globals.css`'s
 * `@theme` block carries the oklch() forms; this script regenerates them exactly from the hex
 * via culori and guards them from drift.
 *
 *   pnpm tokens:check --write   rewrites the 13 `--color-*` oklch() lines in app/globals.css
 *                               (light `@theme` AND the `[data-theme="dark"]` block, Design.md §13.1)
 *                               from the authoritative hex (culori, 3-decimal precision).
 *   pnpm tokens:check           parses globals.css, converts each oklch() back to an 8-bit
 *                               sRGB hex and asserts it equals the authoritative hex (0 diff).
 *                               Prints "N/13 tokens round-trip OK"; exits 1 on any mismatch.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { oklch, formatHex } from "culori";

const HERE = dirname(fileURLToPath(import.meta.url));
const GLOBALS = resolve(HERE, "../app/globals.css");

// Authoritative hex — Design.md §2.1 (13 paper tokens, in table order).
const AUTHORITATIVE: Record<string, string> = {
  "--color-paper": "#F7F1E7",
  "--color-ivory": "#FBF7EF",
  "--color-paper-2": "#EFE7D8",
  "--color-navy": "#0D1735",
  "--color-navy-2": "#2E3854",
  "--color-ink-soft": "#5A6178",
  "--color-rust": "#B64927",
  "--color-terracotta": "#92381F",
  "--color-forest": "#214F43",
  "--color-green-2": "#496D58",
  "--color-steel": "#63799E",
  "--color-note": "#EEDCA9",
  "--color-kraft": "#D7BE93",
};

// Dark twin — Design.md §13.1 (S22/S25, D13): the same 13 names redefined by ROLE under
// `[data-theme="dark"]` in app/globals.css (navy = ink = warm ivory; ivory = card = lifted navy).
// Declared AFTER the light set on purpose: tests/unit/contrast-pairs.test.ts reads the first hit.
const AUTHORITATIVE_DARK: Record<string, string> = {
  "--color-paper": "#0B1530",
  "--color-ivory": "#172646",
  "--color-paper-2": "#101C38",
  "--color-navy": "#F4EEDF",
  "--color-navy-2": "#C7CDD9",
  "--color-ink-soft": "#A3ADBF",
  "--color-rust": "#DC7650",
  "--color-terracotta": "#E8946F",
  "--color-forest": "#8CCBB0",
  "--color-green-2": "#9CC7AD",
  "--color-steel": "#7E94B8",
  "--color-note": "#4B4023",
  "--color-kraft": "#6B5B3C",
};

const BLOCKS = [
  { name: "light", header: "@theme {", tokens: AUTHORITATIVE },
  { name: "dark", header: '[data-theme="dark"] {', tokens: AUTHORITATIVE_DARK },
] as const;

/** [start, end) of a rule body: from its header to the first closing brace (these blocks hold no nested rules). */
function blockRange(css: string, header: string): [number, number] {
  const start = css.indexOf(header);
  if (start < 0) return [-1, -1];
  return [start, css.indexOf("}", start)];
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/** Exact oklch() string for a hex, 3-decimal precision. */
function oklchFor(hex: string): string {
  const c = oklch(hex);
  if (!c) throw new Error(`culori could not parse hex ${hex}`);
  const l = round3(c.l);
  const chroma = round3(c.c);
  const h = round3(c.h ?? 0);
  return `oklch(${l} ${chroma} ${h})`;
}

function lineRegExp(token: string): RegExp {
  // Matches `  --color-x: oklch(...);` capturing the prefix up to the value.
  return new RegExp(`(${escapeRegExp(token)}:\\s*)oklch\\([^)]*\\)`);
}

function write(): void {
  let css = readFileSync(GLOBALS, "utf8");
  let count = 0;
  for (const block of BLOCKS) {
    const [a, b] = blockRange(css, block.header);
    if (a < 0) {
      console.error(`tokens:check --write: ${block.name} block (${block.header}) not found in globals.css`);
      process.exit(1);
    }
    let body = css.slice(a, b);
    for (const [token, hex] of Object.entries(block.tokens)) {
      const re = lineRegExp(token);
      if (!re.test(body)) {
        console.error(`tokens:check --write: token ${token} not found in the ${block.name} block`);
        process.exit(1);
      }
      body = body.replace(re, `$1${oklchFor(hex)}`);
      count += 1;
    }
    css = css.slice(0, a) + body + css.slice(b);
  }
  writeFileSync(GLOBALS, css);
  console.log(`wrote ${count} oklch colour tokens to app/globals.css (light + dark)`);
}

function check(): void {
  const css = readFileSync(GLOBALS, "utf8");
  const total = Object.keys(AUTHORITATIVE).length;
  const failures: string[] = [];
  const summary: string[] = [];

  for (const block of BLOCKS) {
    let ok = 0;
    const [a, b] = blockRange(css, block.header);
    const body = a < 0 ? "" : css.slice(a, b);
    for (const [token, hex] of Object.entries(block.tokens)) {
      const m = body.match(new RegExp(`${escapeRegExp(token)}:\\s*(oklch\\([^)]*\\))`));
      if (!m || !m[1]) {
        failures.push(`[${block.name}] ${token}: no oklch() value found`);
        continue;
      }
      const back = formatHex(m[1]);
      if (!back) {
        failures.push(`[${block.name}] ${token}: could not parse ${m[1]}`);
        continue;
      }
      if (back.toUpperCase() === hex.toUpperCase()) {
        ok += 1;
      } else {
        failures.push(`[${block.name}] ${token}: ${m[1]} → ${back.toUpperCase()} ≠ ${hex.toUpperCase()}`);
      }
    }
    summary.push(block.name === "light" ? `${ok}/${total} tokens round-trip OK` : `${ok}/${total} dark tokens round-trip OK`);
  }

  console.log(summary.join("\n"));
  if (failures.length > 0) {
    console.error(failures.join("\n"));
    process.exit(1);
  }
}

if (process.argv.includes("--write")) {
  write();
} else {
  check();
}
