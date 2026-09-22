/**
 * predeploy-check.ts (TP9/PB4/PB5, technical-plan.md line ~371) — the pre-deploy guard.
 *
 * Runs as the first step of the build chain (`prebuild`, ahead of `validate-content.ts`) so a
 * PII leak, a missing/oversized production video, or a forbidden string never reaches a deploy.
 * Failure modes:
 *
 *   1. `public/resume.pdf` exists AND its PII gate would fail (mirrors the pattern set in
 *      `tests/unit/resume-pii.test.ts` / technical-plan.md TKT-08 S08r.01: `pdftotext -layout`,
 *      fail CLOSED — never skip — when the binary itself cannot be found).
 *   2. `site.resumeAvailable === true` without a resume.pdf present to back it (the flag must
 *      never claim a resume exists that isn't there).
 *   3. Any of `public/video/{teachspark,railcite,velora}.mp4` missing or >4 MB, but **only**
 *      when `VERCEL_ENV === 'production'` (PB4 — previews may ship without them).
 *   4. Any forbidden-string hit (delegates to `scripts/forbidden-strings.ts`'s `scan()`).
 *
 * Pure checks are exported and unit-tested (`tests/unit/predeploy.test.ts`); `main()` only runs
 * as a CLI (`pnpm predeploy` / `tsx scripts/predeploy-check.ts`), following the same
 * export-pure-function + CLI-guard pattern as `forbidden-strings.ts` and `validate-content.ts`.
 */
import { existsSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { site } from "@/lib/site";
import { readSandboxCodes, scan } from "./forbidden-strings";

export interface PredeployIssue {
  code: string;
  message: string;
}

export interface PredeployOptions {
  /** Project root to check against. Defaults to `process.cwd()`. */
  cwd?: string;
  /** Defaults to `process.env.VERCEL_ENV`. PB4 only applies when this is exactly `"production"`. */
  vercelEnv?: string;
}

export interface PredeployResult {
  ok: boolean;
  issues: PredeployIssue[];
}

const FEATURED_VIDEOS = ["teachspark", "railcite", "velora"] as const;
const MAX_VIDEO_BYTES = 4 * 1024 * 1024;

// Same PII patterns as tests/unit/resume-pii.test.ts / technical-plan.md TKT-08 S08r.01 —
// duplicated deliberately (production guard vs. test-suite gate are separate call sites; this
// file is imported at build time and must not depend on a `tests/**` module).
const DOB_PATTERN = /\b(0?[1-9]|[12]\d|3[01])[/\-.](0?[1-9]|1[0-2])[/\-.](\d{4}|\d{2})\b/;
const PHONE_PATTERN = /(\+?91[\s-]?)?\b\d{10}\b/;
const STREET_ADDRESS_PATTERN = /\b(Road|Street|Nagar|Layout|Apartment|Flat No)\b/i;

export interface PiiScanResult {
  ok: boolean;
  reason?: string;
}

/** Extracts PDF text via `pdftotext -layout` and checks it for PII. Fails CLOSED (never skips) when the binary is missing or errors — an unverifiable PDF is never treated as clean. `env` is injectable so tests can point `PATH` at a fake `pdftotext` without touching the real process environment. */
export function scanResumePii(pdfPath: string, env: NodeJS.ProcessEnv = process.env): PiiScanResult {
  const result = spawnSync("pdftotext", ["-layout", pdfPath, "-"], { encoding: "utf8", env });
  if (result.error) {
    return {
      ok: false,
      reason: `cannot verify PDF — pdftotext is unavailable (${result.error.message})`,
    };
  }
  if (result.status !== 0) {
    return {
      ok: false,
      reason: `cannot verify PDF — pdftotext exited ${result.status} on ${pdfPath}: ${result.stderr || "(no stderr)"}`,
    };
  }
  const text = result.stdout;
  if (DOB_PATTERN.test(text)) return { ok: false, reason: "resume PDF matches a DOB pattern" };
  if (PHONE_PATTERN.test(text)) return { ok: false, reason: "resume PDF matches a phone-number pattern" };
  if (STREET_ADDRESS_PATTERN.test(text)) {
    return { ok: false, reason: "resume PDF matches a street-address keyword" };
  }
  return { ok: true };
}

export interface CheckResumeOptions {
  /** Defaults to the live `site.resumeAvailable` (PB5). Injectable so tests can simulate the flag flipping without touching `lib/site.ts`. */
  resumeAvailable?: boolean;
  /** Defaults to `scanResumePii`. Injectable so tests can prove the PII branch without a real PDF. */
  scanPii?: (pdfPath: string) => PiiScanResult;
}

/** Failure modes 1 + 2: resume.pdf PII gate + the resumeAvailable/file-presence invariant (PB5). */
export function checkResume(cwd: string, opts: CheckResumeOptions = {}): PredeployIssue[] {
  const resumeAvailable = opts.resumeAvailable ?? site.resumeAvailable;
  const scanPii = opts.scanPii ?? scanResumePii;
  const resumePath = join(cwd, "public", "resume.pdf");
  const exists = existsSync(resumePath);

  if (resumeAvailable && !exists) {
    return [
      {
        code: "resume-missing",
        message: `site.resumeAvailable is true but ${resumePath} does not exist`,
      },
    ];
  }

  if (!exists) return [];

  const pii = scanPii(resumePath);
  if (!pii.ok) {
    return [{ code: "resume-pii", message: `${resumePath}: ${pii.reason}` }];
  }
  return [];
}

/** Failure mode 3: featured videos present and ≤4 MB — production only (PB4). */
export function checkFeaturedVideos(cwd: string, vercelEnv: string | undefined): PredeployIssue[] {
  if (vercelEnv !== "production") return [];

  const issues: PredeployIssue[] = [];
  for (const name of FEATURED_VIDEOS) {
    const path = join(cwd, "public", "video", `${name}.mp4`);
    if (!existsSync(path)) {
      issues.push({
        code: "video-missing",
        message: `public/video/${name}.mp4 is missing (required at VERCEL_ENV=production, PB4)`,
      });
      continue;
    }
    const size = statSync(path).size;
    if (size > MAX_VIDEO_BYTES) {
      issues.push({
        code: "video-too-large",
        message: `public/video/${name}.mp4 is ${size} bytes, exceeds the 4 MB limit (PB4)`,
      });
    }
  }
  return issues;
}

/** Failure mode 4: forbidden strings, via the shared scanner. */
export function checkForbiddenStrings(cwd: string): PredeployIssue[] {
  const codes = readSandboxCodes(cwd);
  const result = scan({ cwd, sandboxCodes: codes ?? [], sandboxSkipped: codes === null });
  return result.hits.map((hit) => ({
    code: "forbidden-string",
    message: `${hit.file}:${hit.line} → [${hit.pattern}] ${hit.match}`,
  }));
}

export function runPredeployChecks(opts: PredeployOptions = {}): PredeployResult {
  const cwd = opts.cwd ?? process.cwd();
  const vercelEnv = opts.vercelEnv ?? process.env.VERCEL_ENV;

  const issues = [
    ...checkResume(cwd),
    ...checkFeaturedVideos(cwd, vercelEnv),
    ...checkForbiddenStrings(cwd),
  ];

  return { ok: issues.length === 0, issues };
}

function main(): void {
  const result = runPredeployChecks();
  if (!result.ok) {
    for (const issue of result.issues) {
      console.error(`predeploy: [${issue.code}] ${issue.message}`);
    }
    console.error(`\npredeploy FAILED — ${result.issues.length} issue${result.issues.length === 1 ? "" : "s"}`);
    process.exit(1);
  }
  console.log("predeploy OK");
}

// Run only as a CLI, not when imported by the test.
if (process.argv[1] && process.argv[1].endsWith("predeploy-check.ts")) {
  main();
}
