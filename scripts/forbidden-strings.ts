/**
 * forbidden-strings.ts — the never-publish scanner (A3 rule 5, EVAL-013 / EVAL-016).
 *
 * Scans authored source (and, with `--bundle`, the built output) for strings that must never ship:
 * PMP / SAFe-Agilist credential claims, DOB and phone PII, the TeachSpark sandbox join code
 * (value read from git-ignored `tests/forbidden.local.json` — the scan prints a loud SKIP if it is
 * missing so CI never silently passes), "AI Product Manager" used as a title, `.env` key names, and
 * local `/Volumes/E Drive/` paths leaking into the app/bundle. Also fails if `public/resume.pdf`
 * exists while `resumeAvailable === false` (PB5).
 *
 * Usage: `tsx scripts/forbidden-strings.ts [--bundle]`. Exits 1 on any hit; the pure `scan()` is
 * unit-tested against a temp tree.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { site } from "@/lib/site";

type Category = "data" | "content" | "app" | "components" | "public" | "bundle";

export interface Hit {
  file: string;
  line: number;
  pattern: string;
  match: string;
}

interface Rule {
  name: string;
  re: RegExp;
  /** Categories this rule applies to (default: all). */
  only?: Category[];
}

const TEXT_EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".css", ".json", ".md", ".svg", ".txt", ".html"]);

/**
 * Banned title / credential patterns (A3 rule 5, content subset). Defined here — in a directory the
 * scanner does NOT read (`scripts/`) — so the pattern literals never trip the scan themselves, and
 * `data/index.ts` `validateAll()` imports them from here rather than re-declaring the banned strings
 * inside `data/**` (which the scanner DOES read). Single source of truth for both gates.
 */
export const TITLE_CREDENTIAL_PATTERNS: { name: string; re: RegExp }[] = [
  { name: "PMP", re: /\bPMP\b/ },
  { name: "SAFe cert", re: /SAFe (Agilist|certif)/i },
  { name: "AI Product Manager", re: /AI Product Manager/i },
  { name: "Date of Birth", re: /\bDate of Birth\b/i },
];

/** Labels of every banned title/credential pattern that matches `text` (used by validateAll). */
export function contentForbiddenHits(text: string): string[] {
  return TITLE_CREDENTIAL_PATTERNS.filter((p) => p.re.test(text)).map((p) => p.name);
}

/** Base pattern rules (A3 rule 5). Sandbox codes are added at runtime from the local file. */
function baseRules(): Rule[] {
  return [
    ...TITLE_CREDENTIAL_PATTERNS.map((p) => ({ name: p.name, re: p.re })),
    { name: "DOB", re: /\b(0?[1-9]|[12]\d|3[01])[/\-.](0?[1-9]|1[0-2])[/\-.](19|20)\d{2}\b/ },
    { name: "phone +91", re: /\+91[\s-]?\d{5}[\s-]?\d{5}/, only: ["data", "content"] },
    { name: "phone 10-digit", re: /\b\d{10}\b/, only: ["data", "content"] },
    { name: ".env key", re: /ANTHROPIC_API_KEY|SUPABASE_|TWILIO_|VOYAGE_/ },
    { name: "local path", re: /\/Volumes\/E Drive\//, only: ["app", "components", "public", "bundle"] },
  ];
}

interface CategorySpec {
  category: Category;
  dir: string;
  /** Only files with these extensions are read; null → any TEXT_EXT. */
  exts?: string[];
}

function categorySpecs(bundle: boolean): CategorySpec[] {
  const specs: CategorySpec[] = [
    { category: "data", dir: "data" },
    { category: "content", dir: "content", exts: [".md"] },
    { category: "app", dir: "app" },
    { category: "components", dir: "components" },
    { category: "public", dir: "public", exts: [".txt", ".json", ".svg"] },
  ];
  if (bundle) {
    specs.push({ category: "bundle", dir: join(".next", "server", "app"), exts: [".html"] });
    specs.push({ category: "bundle", dir: join(".next", "static"), exts: [".js"] });
  }
  return specs;
}

function walk(dir: string): string[] {
  const out: string[] = [];
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    let s;
    try {
      s = statSync(full);
    } catch {
      continue;
    }
    if (s.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

export interface ScanResult {
  hits: Hit[];
  filesScanned: number;
  sandboxSkipped: boolean;
}

export interface ScanOptions {
  cwd?: string;
  bundle?: boolean;
  /** Extra literal strings to ban (the sandbox join code). */
  sandboxCodes?: string[];
  /** When true, the sandbox file was absent (drives the loud SKIP line). */
  sandboxSkipped?: boolean;
}

export function scan(opts: ScanOptions = {}): ScanResult {
  const cwd = opts.cwd ?? process.cwd();
  const rules = baseRules();
  for (const code of opts.sandboxCodes ?? []) {
    if (code.trim().length > 0) {
      rules.push({ name: "sandbox join code", re: new RegExp(code.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) });
    }
  }

  const hits: Hit[] = [];
  let filesScanned = 0;

  for (const spec of categorySpecs(opts.bundle ?? false)) {
    const files = walk(join(cwd, spec.dir));
    for (const file of files) {
      const ext = extname(file).toLowerCase();
      const allowed = spec.exts ? spec.exts.includes(ext) : TEXT_EXT.has(ext);
      if (!allowed) continue;

      let text: string;
      try {
        text = readFileSync(file, "utf8");
      } catch {
        continue;
      }
      if (text.includes(String.fromCharCode(0))) continue; // binary guard (skip files with a NUL byte)
      filesScanned++;

      const lines = text.split("\n");
      for (const rule of rules) {
        if (rule.only && !rule.only.includes(spec.category)) continue;
        lines.forEach((line, i) => {
          const m = rule.re.exec(line);
          if (m) hits.push({ file: relative(cwd, file), line: i + 1, pattern: rule.name, match: m[0] });
        });
      }
    }
  }

  // PB5: resume.pdf must not exist while the flag says it is unavailable.
  if (!site.resumeAvailable && existsSync(join(cwd, "public", "resume.pdf"))) {
    hits.push({ file: "public/resume.pdf", line: 0, pattern: "resume.pdf while resumeAvailable=false", match: "present" });
  }

  return { hits, filesScanned, sandboxSkipped: opts.sandboxSkipped ?? false };
}

/** Read the git-ignored sandbox-code list; returns null when the file is absent. */
export function readSandboxCodes(cwd = process.cwd()): string[] | null {
  const p = join(cwd, "tests", "forbidden.local.json");
  if (!existsSync(p)) return null;
  try {
    const parsed = JSON.parse(readFileSync(p, "utf8")) as { strings?: string[] };
    return parsed.strings ?? [];
  } catch {
    return [];
  }
}

function main(): void {
  const bundle = process.argv.includes("--bundle");
  const codes = readSandboxCodes();
  const sandboxSkipped = codes === null;
  if (sandboxSkipped) {
    console.error("SKIP: forbidden.local.json missing — sandbox join code not scanned");
  }

  const result = scan({ bundle, sandboxCodes: codes ?? [], sandboxSkipped });

  if (result.hits.length > 0) {
    for (const h of result.hits) {
      console.error(`${h.file}:${h.line} → [${h.pattern}] ${h.match}`);
    }
    console.error(`\n${result.hits.length} forbidden hit${result.hits.length === 1 ? "" : "s"} in ${result.filesScanned} files`);
    process.exit(1);
  }

  console.log(`0 hits in ${result.filesScanned} files${bundle ? " (incl. .next bundle)" : ""}`);
}

// Run only as a CLI, not when imported by the test.
if (process.argv[1] && process.argv[1].endsWith("forbidden-strings.ts")) {
  main();
}
