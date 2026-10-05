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
  /** A credential-claim rule — not applied on `CREDENTIAL_SURFACES` (TKT-102). */
  credentialClaim?: boolean;
}

/**
 * TKT-102 (Tushar 2026-09-26): the `/certifications` surfaces may name PMP / SAFe — both are now
 * Credly-verified credentials (individual credential URLs in `data/certifications.ts`), which retires
 * CONTENT_INVENTORY §4.6's "banner-only claim" reason for THOSE files only. Everywhere else (awards,
 * bios, about, experience, …) the credential-claim ban stands unchanged. Paths are POSIX, relative
 * to the scan root; the bundle entry covers the prerendered `/certifications` HTML.
 */
export const CREDENTIAL_SURFACES: readonly RegExp[] = [
  /^data\/certifications\.ts$/,
  /^components\/certifications\//,
  /^app\/certifications\//,
  /^\.next\/server\/app\/certifications(\.html|\/)/,
];

export function isCredentialSurface(relPath: string): boolean {
  const posix = relPath.split("\\").join("/");
  return CREDENTIAL_SURFACES.some((re) => re.test(posix));
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

/**
 * Canonical PII rules — the SINGLE source for this scanner, the `predeploy-check.ts` résumé gate and
 * `tests/unit/resume-pii.test.ts` (CR-005/CR-008, Stage 9: three hand-copied variants had drifted —
 * one accepted a bare 2-digit year and so flagged version-like `12.05.26` as a DOB, another only
 * matched 10 *contiguous* digits and let `+91 98765 43210` through). Year must be 19xx/20xx; phone
 * covers the spaced/dashed `+91` form AND a bare 10-digit run. No `g` flag — safe for `.test()`.
 */
export const PII_PATTERNS = {
  DOB: /\b(0?[1-9]|[12]\d|3[01])[/\-.](0?[1-9]|1[0-2])[/\-.](19|20)\d{2}\b/,
  PHONE: /\+91[\s-]?\d{5}[\s-]?\d{5}|(\+?91[\s-]?)?\b\d{10}\b/,
  STREET_ADDRESS: /\b(Road|Street|Nagar|Layout|Apartment|Flat No)\b/i,
} as const;

/**
 * Résumé-only PII rules (SEC-001, Stage 10) — applied by `scanResumePii` to the extracted PDF text
 * IN ADDITION to `PII_PATTERNS`. The shared rules above were format-narrow: `1990-05-12`,
 * `12 May 1990`, `+1 (415) 555-0123`, `98765 43210`, `42 Elm Avenue` and `PIN 560001` all passed the
 * gate. These broader forms are deliberately NOT part of the source/content scan (`baseRules`):
 * authored content legitimately carries ISO `asOf` dates (`2026-09-15`), day-month-year dates
 * ("7 Sep 2026") and 6-digit figures (patent no. 429867) — a résumé's text should carry none of them
 * except as PII. Each rule is specific (country code / parentheses / labelled postal code) rather
 * than "any long digit run", so a clean résumé's date ranges and counts never trip it.
 */
export const RESUME_PII_PATTERNS: ReadonlyArray<{ name: string; re: RegExp }> = [
  { name: "DOB (dd/mm/yyyy)", re: PII_PATTERNS.DOB },
  { name: "DOB (ISO yyyy-mm-dd)", re: /\b(19|20)\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])\b/ },
  {
    name: "DOB (textual month)",
    re: /\b(0?[1-9]|[12]\d|3[01])(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?,?\s+(19|20)\d{2}\b|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s+(0?[1-9]|[12]\d|3[01])(?:st|nd|rd|th)?,?\s+(19|20)\d{2}\b/i,
  },
  { name: "phone-number (+91 / bare 10-digit)", re: PII_PATTERNS.PHONE },
  { name: "phone-number (international +cc)", re: /\+\d{1,3}[\s-]?\(?\d{2,4}\)?[\s-]?\d{3,4}[\s-]?\d{3,4}\b/ },
  { name: "phone-number (parenthesised area code)", re: /\(\d{3}\)\s?\d{3}[\s-]?\d{4}\b/ },
  { name: "phone-number (spaced/dashed 10-digit)", re: /\b\d{5}[\s-]\d{5}\b/ },
  { name: "street-address keyword", re: PII_PATTERNS.STREET_ADDRESS },
  {
    name: "street-address keyword (extended)",
    re: /\b(Avenue|Ave\.|Lane|Drive|Boulevard|Blvd\.?|Sector|Phase|House No\.?|H\.? ?No\.?|Door No\.?)\b/i,
  },
  { name: "postal-code (labelled)", re: /\b(PIN|Pincode|Pin Code|ZIP|Zip Code|Postal Code)\b\s*[:\-]?\s*\d{5,6}\b/i },
];

/** Base pattern rules (A3 rule 5). Sandbox codes are added at runtime from the local file. */
function baseRules(): Rule[] {
  return [
    ...TITLE_CREDENTIAL_PATTERNS.map((p) => ({
      name: p.name,
      re: p.re,
      credentialClaim: p.name === "PMP" || p.name === "SAFe cert",
    })),
    { name: "DOB", re: PII_PATTERNS.DOB },
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

/** A path the scanner could not read — surfaced to the caller, never swallowed (SF-1/SF-2, Stage 9). */
export interface SkippedPath {
  path: string;
  reason: string;
}

const errCode = (err: unknown): string => {
  const code = (err as { code?: unknown } | null)?.code; // Node fs errors carry a string `code` (ENOENT, EACCES…)
  if (typeof code === "string") return code;
  return err instanceof Error ? err.message : String(err);
};

/**
 * Recursively list files under `dir`. FAIL-CLOSED: an unreadable directory or entry is recorded in
 * `skipped` (which fails the predeploy gate) instead of silently shrinking the scan — an
 * under-scanned tree must never report "0 hits". The one tolerated case is a source-category ROOT
 * that simply does not exist (`ENOENT` with `tolerateAbsentRoot`): "absent" is a legitimate tree
 * shape (partial test fixtures), whereas "unreadable" never is. The `bundle` category does NOT get
 * that tolerance — `--bundle` with no `.next` build is a real, recorded skip.
 */
function walk(dir: string, skipped: SkippedPath[], tolerateAbsentRoot = false): string[] {
  const out: string[] = [];
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch (err) {
    if (!(tolerateAbsentRoot && errCode(err) === "ENOENT")) skipped.push({ path: dir, reason: errCode(err) });
    return out;
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    let s;
    try {
      s = statSync(full);
    } catch (err) {
      skipped.push({ path: full, reason: errCode(err) });
      continue;
    }
    if (s.isDirectory()) out.push(...walk(full, skipped));
    else out.push(full);
  }
  return out;
}

export interface ScanResult {
  hits: Hit[];
  filesScanned: number;
  sandboxSkipped: boolean;
  /** Paths the scan could NOT read. Non-empty ⇒ the tree is unverified ⇒ the gate must fail (SF-1/2). */
  skipped: SkippedPath[];
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
  const skipped: SkippedPath[] = [];
  let filesScanned = 0;

  for (const spec of categorySpecs(opts.bundle ?? false)) {
    // Source categories may legitimately be absent (partial fixtures); a missing `.next` under
    // --bundle is a real skip and is recorded (see `walk`).
    const files = walk(join(cwd, spec.dir), skipped, spec.category !== "bundle");
    for (const file of files) {
      const ext = extname(file).toLowerCase();
      const allowed = spec.exts ? spec.exts.includes(ext) : TEXT_EXT.has(ext);
      if (!allowed) continue;

      let text: string;
      try {
        text = readFileSync(file, "utf8");
      } catch (err) {
        // SF-2: an unreadable file is an unverified file — recorded, never silently dropped.
        skipped.push({ path: relative(cwd, file), reason: errCode(err) });
        continue;
      }
      if (text.includes(String.fromCharCode(0))) continue; // binary guard (skip files with a NUL byte)
      filesScanned++;

      const lines = text.split("\n");
      const credentialSurface = isCredentialSurface(relative(cwd, file));
      for (const rule of rules) {
        if (rule.only && !rule.only.includes(spec.category)) continue;
        if (rule.credentialClaim && credentialSurface) continue;
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

  return { hits, filesScanned, sandboxSkipped: opts.sandboxSkipped ?? false, skipped };
}

/**
 * Read the git-ignored sandbox-code list. Returns `null` when the file is ABSENT (the documented,
 * loud "SKIP" path) and THROWS when it is present but unreadable/malformed — SF-3 (Stage 9): a corrupt
 * file previously returned `[]`, silently degrading to "verified zero codes" with no SKIP line.
 */
export function readSandboxCodes(cwd = process.cwd()): string[] | null {
  const p = join(cwd, "tests", "forbidden.local.json");
  if (!existsSync(p)) return null;
  try {
    const parsed = JSON.parse(readFileSync(p, "utf8")) as { strings?: string[] };
    return parsed.strings ?? [];
  } catch (err) {
    throw new Error(
      `tests/forbidden.local.json exists but is unreadable/malformed (${errCode(err)}) — fix or delete it; a corrupt sandbox-code list is not "no codes".`,
    );
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

  // SF-1/SF-2: an unverified path is a failure, not a smaller "0 hits" (fail closed).
  if (result.skipped.length > 0) {
    for (const s of result.skipped) {
      console.error(`SKIPPED (cannot verify): ${s.path} — ${s.reason}`);
    }
    console.error(`\n${result.skipped.length} path${result.skipped.length === 1 ? "" : "s"} could not be scanned — tree is unverified`);
    process.exit(1);
  }

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
