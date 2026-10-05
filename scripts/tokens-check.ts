/**
 * tokens-check.ts (D2) — OKLCH regeneration guard.
 *
 * The authoritative colour source is the 13 paper hex values in Design.md §2.1 (mirrored
 * below; S12/D2 — the clay set in DESIGN_DIRECTION.md §2 is retired). `app/globals.css`'s
 * `@theme` block carries the oklch() forms; this script regenerates them exactly from the hex
 * via culori and guards them from drift.
 *
 *   pnpm tokens:check --write   rewrites the 13 `--color-*` oklch() lines in app/globals.css
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
  for (const [token, hex] of Object.entries(AUTHORITATIVE)) {
    const re = lineRegExp(token);
    if (!re.test(css)) {
      console.error(`tokens:check --write: token ${token} not found in globals.css`);
      process.exit(1);
    }
    css = css.replace(re, `$1${oklchFor(hex)}`);
  }
  writeFileSync(GLOBALS, css);
  console.log(`wrote ${Object.keys(AUTHORITATIVE).length} oklch colour tokens to app/globals.css`);
}

function check(): void {
  const css = readFileSync(GLOBALS, "utf8");
  const total = Object.keys(AUTHORITATIVE).length;
  let ok = 0;
  const failures: string[] = [];

  for (const [token, hex] of Object.entries(AUTHORITATIVE)) {
    const m = css.match(new RegExp(`${escapeRegExp(token)}:\\s*(oklch\\([^)]*\\))`));
    if (!m || !m[1]) {
      failures.push(`${token}: no oklch() value found`);
      continue;
    }
    const back = formatHex(m[1]);
    if (!back) {
      failures.push(`${token}: could not parse ${m[1]}`);
      continue;
    }
    if (back.toUpperCase() === hex.toUpperCase()) {
      ok += 1;
    } else {
      failures.push(`${token}: ${m[1]} → ${back.toUpperCase()} ≠ ${hex.toUpperCase()}`);
    }
  }

  console.log(`${ok}/${total} tokens round-trip OK`);
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
