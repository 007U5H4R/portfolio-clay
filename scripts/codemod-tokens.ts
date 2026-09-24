/**
 * codemod-tokens.ts (TSK-30 / technical-plan S69.03) — TEMPORARY, deleted at TKT-89.
 *
 * Renames every consumer of the 13 retired clay colour tokens to the 13 paper tokens (Design.md
 * §2.1, decision S12: one atomic rename, no side-by-side "expand" step because the 13-count gate
 * forbids it). Scope: `app/**`, `components/**`, `lib/**`, `tests/**` — `.ts`, `.tsx`, `.css`.
 *
 * Rules (S69.03):
 *   (a) Tailwind utilities  `<prefix>-<old>`  → `<prefix>-<new>` — variant prefixes (`hover:`,
 *       `md:`) and opacity suffixes (`/30`) are preserved by the lookbehind/lookahead; `bg-white`,
 *       `text-white`, `tone="mint"`, `data-tone`, `stageTone.sky` and enum keys are NOT matched.
 *   (b) `var(--color-<old>)` → `var(--color-<new>)` (CSS + inline style strings).
 *   (c) `@apply` lines and (d) the `toneClass`/`tierClass`/`stageTone` class maps go through (a).
 *   Longest key first so `ink-2` / `accent-deep` win over `ink` / `accent`.
 *
 * Every rewrite is printed as `file:line  old → new` so the diff can be reviewed for false
 * positives before the commit (S69.04). `--dry` prints without writing. A built-in self-test runs
 * on every invocation and aborts (exit 1) if any fixture misbehaves.
 *
 *   pnpm exec tsx scripts/codemod-tokens.ts --dry    preview (prints rewrites, writes nothing)
 *   pnpm exec tsx scripts/codemod-tokens.ts          apply
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");

/** Retired clay name → paper name (Design.md §2.1 "Replaces" column). */
const MAP: Record<string, string> = {
  bg: "paper",
  surface: "ivory",
  lavender: "paper-2",
  ink: "navy",
  "ink-2": "navy-2",
  "ink-3": "ink-soft",
  accent: "rust",
  "accent-deep": "terracotta",
  mint: "forest",
  sky: "green-2",
  blush: "steel",
  peach: "note",
  butter: "kraft",
};

/**
 * Tailwind colour-utility prefixes. The S69.03 list plus `divide` — `md:divide-ink/10`
 * (DecisionCard) is a colour utility too and would otherwise be left dangling (no colour resolves).
 */
const PREFIXES = [
  "bg",
  "text",
  "border",
  "fill",
  "stroke",
  "outline",
  "ring",
  "from",
  "via",
  "to",
  "decoration",
  "placeholder",
  "shadow",
  "accent",
  "divide",
];

const SCOPE_DIRS = ["app", "components", "lib", "tests"];
const EXTS = new Set([".ts", ".tsx", ".css"]);

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Longest-key-first ordering (belt and braces with the lookahead) so `ink-2` wins over `ink`.
const OLD_NAMES = Object.keys(MAP).sort((a, b) => b.length - a.length);
const OLD_ALT = OLD_NAMES.map(escapeRegExp).join("|");

/**
 * Rule (a)/(c)/(d): `(?<![\w-])(prefix)-(old)(?=[\s"'`/:\];]|$)`. The S69.03 lookahead set plus
 * `;` — a CSS `@apply bg-bg text-ink;` line ends in a semicolon (caught by the self-test). `;`
 * cannot follow a longer token name, so `ink` still never matches inside `ink-2`. Vitest regex
 * literals such as `/\btext-ink\b/` are deliberately NOT matched (the `b` of `\b` trips the
 * lookbehind) — those assertions are renamed by hand in S69.04.
 */
const UTILITY_RE = new RegExp(`(?<![\\w-])(${PREFIXES.join("|")})-(${OLD_ALT})(?=[\\s"'\`/:\\];]|$)`, "g");
/** Rule (b): `var(--color-<old>)`. */
const VAR_RE = new RegExp(`var\\(--color-(${OLD_ALT})\\)`, "g");

export interface Change {
  from: string;
  to: string;
}

/** Apply every rule to one line; returns the rewritten line and each individual rewrite. */
export function rewriteLine(line: string): { out: string; changes: Change[] } {
  const changes: Change[] = [];
  let out = line.replace(UTILITY_RE, (whole, prefix: string, old: string) => {
    const to = `${prefix}-${MAP[old]}`;
    changes.push({ from: whole, to });
    return to;
  });
  out = out.replace(VAR_RE, (whole, old: string) => {
    const to = `var(--color-${MAP[old]})`;
    changes.push({ from: whole, to });
    return to;
  });
  return { out, changes };
}

/** Built-in fixtures (S69.03 + the brief's `text-ink-2 border-accent-deep` cases). */
const SELF_TEST: ReadonlyArray<[input: string, expected: string]> = [
  // The S69.03 fixture verbatim: bg-white and tone-mint untouched, opacity + variant preserved.
  ["bg-bg text-ink-3 hover:bg-lavender/30 bg-white tone-mint", "bg-paper text-ink-soft hover:bg-paper-2/30 bg-white tone-mint"],
  // Longest-first: ink-2 / accent-deep must not be split into ink / accent.
  ["text-ink-2 border-accent-deep text-ink", "text-navy-2 border-terracotta text-navy"],
  ["hover:bg-accent-deep/80 focus-visible:ring-accent text-white", "hover:bg-terracotta/80 focus-visible:ring-rust text-white"],
  // divide utility + string-terminated forms (quote, bracket, template literal, end of line).
  ['className="md:divide-ink/10 bg-surface"', 'className="md:divide-navy/10 bg-ivory"'],
  ["'#cta [class*=\"bg-lavender/30\"]'", "'#cta [class*=\"bg-paper-2/30\"]'"],
  ["`${x ? \"bg-blush\" : \"\"} text-peach", "`${x ? \"bg-steel\" : \"\"} text-note"],
  // Rule (c): @apply lines (`;`-terminated).
  ["    @apply bg-bg text-ink;", "    @apply bg-paper text-navy;"],
  // Vitest `\b`-bounded regex literals are out of reach (lookbehind) and stay for the hand pass.
  ["toMatch(/\\bbg-accent\\b/)", "toMatch(/\\bbg-accent\\b/)"],
  // Rule (b): CSS variable references, incl. inside color-mix().
  ["background: color-mix(in oklch, var(--color-accent) 34%, transparent);", "background: color-mix(in oklch, var(--color-rust) 34%, transparent);"],
  ['probe.style.color = "var(--color-accent)";', 'probe.style.color = "var(--color-rust)";'],
  // Decoys that must NOT change: prop enum values, data attributes, map keys, arbitrary values,
  // English words, and partial names.
  ['tone="mint" data-tone="sky" stageTone.sky toneClass[tone] bg-[image:var(--gradient-clay-volume)]', 'tone="mint" data-tone="sky" stageTone.sky toneClass[tone] bg-[image:var(--gradient-clay-volume)]'],
  ["the ink of a butter sky; bg-bg-x text-inking var(--color-ink-4)", "the ink of a butter sky; bg-bg-x text-inking var(--color-ink-4)"],
];

function selfTest(): void {
  const failures: string[] = [];
  for (const [input, expected] of SELF_TEST) {
    const { out } = rewriteLine(input);
    if (out !== expected) failures.push(`  input:    ${input}\n  expected: ${expected}\n  got:      ${out}`);
  }
  if (failures.length > 0) {
    console.error(`codemod-tokens self-test FAILED (${failures.length}/${SELF_TEST.length}):\n${failures.join("\n\n")}`);
    process.exit(1);
  }
  console.error(`self-test OK (${SELF_TEST.length} fixtures)`);
}

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) out.push(...walk(full));
    else if (EXTS.has(extname(full))) out.push(full);
  }
  return out;
}

function main(): void {
  const dry = process.argv.includes("--dry");
  selfTest();

  let rewrites = 0;
  let filesChanged = 0;
  for (const dir of SCOPE_DIRS) {
    for (const file of walk(join(ROOT, dir))) {
      const rel = relative(ROOT, file);
      const text = readFileSync(file, "utf8");
      const lines = text.split("\n");
      let touched = false;
      const next = lines.map((line, i) => {
        const { out, changes } = rewriteLine(line);
        for (const c of changes) {
          console.log(`${rel}:${i + 1}  ${c.from} → ${c.to}`);
          rewrites += 1;
        }
        if (changes.length > 0) touched = true;
        return out;
      });
      if (touched) {
        filesChanged += 1;
        if (!dry) writeFileSync(file, next.join("\n"));
      }
    }
  }
  console.error(`${rewrites} rewrites in ${filesChanged} files${dry ? " (dry run — nothing written)" : ""}`);
}

// Run only as a CLI, not when imported.
if (process.argv[1] && process.argv[1].endsWith("codemod-tokens.ts")) {
  main();
}
