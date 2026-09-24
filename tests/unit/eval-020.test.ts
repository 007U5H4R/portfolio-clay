import { describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

/**
 * EVAL-020 — the paper token gate (S12 / D2; TKT-69 S69.07; TC-122, TC-123).
 *
 * `scripts/eval.ts` maps EVAL-020 to this file by name (generic Vitest mapping, F1-5), so the
 * status `pnpm eval --only EVAL-020` reports is this file's pass/fail — nothing hand-entered.
 *
 *   (1) `scripts/tokens-check.ts` prints `13/13 tokens round-trip OK` and exits 0.
 *   (2) `app/globals.css` defines exactly the 13 paper `--color-*` names — no 14th, none missing.
 *   (3) No colour literal (hex / rgb(a) / hsl(a) / oklch / oklab) in `app/**`, `components/**` or `lib/**`
 *       outside the two allow-listed files (`app/globals.css`, `lib/og.tsx`). Covering `lib/**`
 *       is TC-123 step 4: `lib/og.tsx` is the only file under `lib/` allowed a literal.
 *   (4) Zero retired clay names — Tailwind utility form and `--color-<name>` form — in
 *       `app/**`, `components/**`, `lib/**`.
 *   (5) Positive control: the same scanner functions over `tests/fixtures/retired-tokens.fixture.txt`
 *       find exactly the 5 planted hits and none of the decoys, so a 0 in (3)/(4) means "clean",
 *       not "the regex can't see anything".
 */

const ROOT = process.cwd();

const PAPER_NAMES = [
  "paper",
  "ivory",
  "paper-2",
  "navy",
  "navy-2",
  "ink-soft",
  "rust",
  "terracotta",
  "forest",
  "green-2",
  "steel",
  "note",
  "kraft",
] as const;

const RETIRED_NAMES = [
  "bg",
  "surface",
  "lavender",
  "ink",
  "ink-2",
  "ink-3",
  "accent",
  "accent-deep",
  "mint",
  "sky",
  "blush",
  "peach",
  "butter",
] as const;

/** Files allowed to hold colour literals: the token source and the OG image module (D11). */
const LITERAL_ALLOWLIST = new Set(["app/globals.css", "lib/og.tsx"]);

const SCAN_EXTENSIONS = [".ts", ".tsx", ".css"];

// ---------------------------------------------------------------------------------------------
// Scanners — the real-tree tests and the fixture control call these same functions.
// ---------------------------------------------------------------------------------------------

type Hit = { rule: "literal" | "retired-utility" | "retired-var"; line: number; match: string };

/**
 * Blank out `// line` and `/* block *\/` comments, keeping string literals intact and every
 * newline in place (so reported line numbers stay true).
 *
 * Why strip comments before the literal scan: a comment is not a colour. The hex regex otherwise
 * matches error-code references such as "React #185" in `components/navigation/Header.tsx` and
 * `lib/motion.ts` — false positives that would force either an allow-list entry (which would
 * then also hide a real literal in that file) or an edit to unrelated code. Strings are matched
 * first so `"https://…"` is never mistaken for a comment and a literal after it on the same line
 * is still seen. The stripper is deliberately small (not a parser). Known limits: a stray quote
 * before a comment leaves the comment in place (can only add a hit); a bare `//` or `/*` outside a
 * string — JSX text like `http://…`, a regex literal — blanks the rest of that line (could hide a
 * literal there). On 2026-09-24 stripping removed exactly the two comment hits above and nothing
 * else (TSK-32 report); if a real literal ever hides this way, move to a TS/CSS tokenizer.
 */
function stripComments(source: string): string {
  const re = /("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`)|\/\*[\s\S]*?\*\/|\/\/[^\n]*/g;
  return source.replace(re, (whole, str: string | undefined) => (str !== undefined ? whole : whole.replace(/[^\n]/g, " ")));
}

// The S69.07 regex plus the alpha spellings: `\b(rgb|hsl)\(` alone would let `rgba(` / `hsla(` through.
const LITERAL_RE = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab)\(/gi;

const RETIRED_ALT = [...RETIRED_NAMES].sort((a, b) => b.length - a.length).join("|");

/**
 * Tailwind utility form: colour-taking prefix + retired name + a token boundary (S69.04 regex,
 * plus `divide` and `;` — the two gaps TSK-30's codemod self-test found). Optional variant
 * prefixes (`hover:`) pass the lookbehind; opacity suffixes (`/30`) pass the lookahead.
 *
 * English-word allow-list: none needed. The regex is prefix-anchored (`bg-|text-|border-|…`), so
 * bare words in copy ("surface", "accent", "sky"), tone *prop* values (`tone="mint"` — enum values,
 * F1-11) and paper names that merely start with a retired stem (`text-ink-soft`, `bg-paper-2`) can
 * never match. The fixture's decoy lines prove it.
 */
const RETIRED_UTILITY_RE = new RegExp(
  `(?<![\\w-])(?:bg|text|border|divide|fill|stroke|outline|ring|from|via|to|decoration|placeholder|shadow|accent)-(?:${RETIRED_ALT})(?=[\\s"'\`/:;\\]]|$)`,
  "gm",
);

/** Custom-property form: `var(--color-<retired>)` (incl. a fallback) and a `--color-<retired>:` definition. */
const RETIRED_VAR_RE = new RegExp(`var\\(\\s*--color-(?:${RETIRED_ALT})(?=[\\s,)])|--color-(?:${RETIRED_ALT})\\s*:`, "g");

function lineOf(text: string, index: number): number {
  let n = 1;
  for (let i = 0; i < index; i++) if (text.charCodeAt(i) === 10) n++;
  return n;
}

function collect(text: string, re: RegExp, rule: Hit["rule"]): Hit[] {
  return [...text.matchAll(re)].map((m) => ({ rule, line: lineOf(text, m.index), match: m[0] }));
}

/** Colour literals, after comment stripping. */
function scanLiterals(source: string): Hit[] {
  return collect(stripComments(source), LITERAL_RE, "literal");
}

/**
 * Retired clay names. Deliberately NOT comment-stripped: a retired token name in a comment is
 * still a stale reference (EVAL-020 is also the dead-code gate for TKT-89), and unlike the hex
 * regex this one has no false-positive source in comments.
 */
function scanRetired(source: string): Hit[] {
  return [...collect(source, RETIRED_UTILITY_RE, "retired-utility"), ...collect(source, RETIRED_VAR_RE, "retired-var")];
}

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (SCAN_EXTENSIONS.some((ext) => entry.name.endsWith(ext))) out.push(full);
  }
  return out;
}

function sourceFiles(...dirs: string[]): string[] {
  return dirs.flatMap((d) => walk(join(ROOT, d))).map((f) => relative(ROOT, f).split(sep).join("/"));
}

function scanTree(files: string[], scanner: (s: string) => Hit[]): string[] {
  return files.flatMap((f) => scanner(readFileSync(join(ROOT, f), "utf8")).map((h) => `${f}:${h.line} [${h.rule}] ${h.match}`));
}

// ---------------------------------------------------------------------------------------------

describe("EVAL-020 paper token gate", () => {
  it("(1) tokens-check round-trips 13/13 (TC-122 step 1)", () => {
    const r = spawnSync("pnpm", ["exec", "tsx", "scripts/tokens-check.ts"], { cwd: ROOT, encoding: "utf8", timeout: 60_000 });
    expect(r.stdout, r.stderr).toMatch(/^13\/13 tokens round-trip OK/m);
    expect(r.status).toBe(0);
  }, 60_000);

  it("(2) globals.css defines exactly the 13 paper --color-* tokens (TC-122 step 2)", () => {
    const css = readFileSync(join(ROOT, "app/globals.css"), "utf8");
    const defined = [...css.matchAll(/^\s*--color-([a-z0-9-]+)\s*:/gm)].map((m) => m[1]);
    expect(defined).toHaveLength(13);
    expect([...defined].sort()).toEqual([...PAPER_NAMES].sort());
  });

  it("(3) no colour literal outside app/globals.css + lib/og.tsx (TC-123 steps 2 and 4)", () => {
    const files = sourceFiles("app", "components", "lib").filter((f) => !LITERAL_ALLOWLIST.has(f));
    expect(files.length).toBeGreaterThan(50);
    expect(scanTree(files, scanLiterals)).toEqual([]);
  });

  it("(4) zero retired clay token names in app/, components/, lib/ (TC-123 step 1)", () => {
    const files = sourceFiles("app", "components", "lib");
    expect(files).toContain("app/globals.css");
    expect(scanTree(files, scanRetired)).toEqual([]);
  });

  it("(5) positive control: the same scanners find the 5 planted hits and no decoy (TC-123 step 3)", () => {
    const fixture = readFileSync(join(ROOT, "tests/fixtures/retired-tokens.fixture.txt"), "utf8");
    const hits = [...scanLiterals(fixture), ...scanRetired(fixture)].map((h) => h.match);
    // `hover:` is matched by the lookbehind, not consumed, so the utility hit reads `bg-lavender`.
    expect(hits.sort()).toEqual(["#FAF9FF", "bg-lavender", "oklch(", "text-ink-3", "var(--color-accent"].sort());
    // Every planted line is caught; no DECOY line is.
    const lines = fixture.split("\n");
    const hitLines = new Set([...scanLiterals(fixture), ...scanRetired(fixture)].map((h) => lines[h.line - 1] ?? ""));
    expect([...hitLines].every((l) => l.startsWith("HIT "))).toBe(true);
    expect(lines.filter((l) => l.startsWith("HIT ")).every((l) => hitLines.has(l))).toBe(true);
  });

  it("(5b) comment stripping hides comments, never strings", () => {
    expect(scanLiterals("// see React #185\n/* #abcdef */")).toEqual([]);
    expect(scanLiterals('const u = "https://example.com"; const c = "#abcdef";')).toHaveLength(1);
    expect(scanLiterals('const a = "rgba(0, 0, 0, .1)", b = "hsla(0 0% 0% / .1)";')).toHaveLength(2);
    expect(stripComments("a /* x\ny */ b").split("\n")).toHaveLength(2);
  });
});
