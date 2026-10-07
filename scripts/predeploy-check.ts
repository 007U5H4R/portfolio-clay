/**
 * predeploy-check.ts (TP9/PB4/PB5, technical-plan.md line ~371) — the pre-deploy guard.
 *
 * Runs as the first step of the build chain (`prebuild`, ahead of `validate-content.ts`) so a
 * PII leak, a missing/oversized production video, or a forbidden string never reaches a deploy.
 * Failure modes:
 *
 *   1. `public/resume.pdf` exists (TASK-175: the resume is the Google Drive link; no PDF may be committed).
 *   2. `site.resumeUrl` is not an https://drive.google.com/ link.
 *   3. A featured product (`data/projects.ts` `featured` ranks) without a pitch video — a valid
 *      `pitchVideo` provider + id in `data/portfolio.ts` — but **only** when
 *      `VERCEL_ENV === 'production'` (PB4 — previews may ship without them). Tushar 2026-10-05: the
 *      videos live on YouTube (TASK-122), so PB4 checks the ids, no longer local MP4s.
 *   4. Any forbidden-string hit (delegates to `scripts/forbidden-strings.ts`'s `scan()`).
 *
 * Pure checks are exported and unit-tested (`tests/unit/predeploy.test.ts`); `main()` only runs
 * as a CLI (`pnpm predeploy` / `tsx scripts/predeploy-check.ts`), following the same
 * export-pure-function + CLI-guard pattern as `forbidden-strings.ts` and `validate-content.ts`.
 */
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { site } from "@/lib/site";
import { projects } from "@/data/projects";
import { portfolioEntries } from "@/data/portfolio";
import type { VideoMediaEntry } from "@/data/schema";
import { isValidVideoId } from "@/lib/video-providers";
import { RESUME_PII_PATTERNS, readSandboxCodes, scan } from "./forbidden-strings";

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


// CR-005 / CR-008 (Stage 9) + SEC-001 (Stage 10): the PII rules live ONCE, in
// `scripts/forbidden-strings.ts` (already imported here, so no `tests/**` dependency) — this file
// previously carried its own hand-copied, drifted variant. `scanResumePii` applies the résumé-only
// superset `RESUME_PII_PATTERNS` (which includes the shared `PII_PATTERNS`).

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
  // SEC-001 (Stage 10): the résumé gate applies the full résumé-only superset (ISO/textual DOB,
  // international/parenthesised/spaced phones, Western street keywords, labelled postal codes) —
  // not just the narrow shared rules that let `1990-05-12` or `+1 (415) 555-0123` through.
  for (const { name, re } of RESUME_PII_PATTERNS) {
    if (re.test(text)) return { ok: false, reason: `resume PDF matches a ${name} pattern` };
  }
  return { ok: true };
}

export interface CheckResumeOptions {
  /** Defaults to the live `site.resumeUrl` (PB5, TASK-175). Injectable so tests can prove the URL guard without touching `lib/site.ts`. */
  resumeUrl?: string;
}

/** The resume must be Tushar's Google Drive file, over https (TASK-175). */
export function isDriveResumeUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "https:" && u.hostname === "drive.google.com";
  } catch {
    return false;
  }
}

/**
 * Failure modes 1 + 2 (PB5, TASK-175): the resume is an external Google Drive link, so no resume PDF may be
 * committed to `public/` (it would be served, PII and all), and `site.resumeUrl` must be https on drive.google.com.
 */
export function checkResume(cwd: string, opts: CheckResumeOptions = {}): PredeployIssue[] {
  const resumeUrl = opts.resumeUrl ?? site.resumeUrl;
  const resumePath = join(cwd, "public", "resume.pdf");
  const issues: PredeployIssue[] = [];

  if (existsSync(resumePath)) {
    issues.push({
      code: "resume-pdf-committed",
      message: `${resumePath} exists: the resume is the Google Drive link (site.resumeUrl); no resume PDF may ship in public/`,
    });
  }
  if (!isDriveResumeUrl(resumeUrl)) {
    issues.push({
      code: "resume-url",
      message: `site.resumeUrl must be an https://drive.google.com/ link, got "${resumeUrl}"`,
    });
  }
  return issues;
}

/** A featured product and the pitch video its portfolio entry carries (if any). */
export interface FeaturedVideo {
  slug: string;
  pitchVideo?: Pick<VideoMediaEntry, "provider" | "videoId"> | undefined;
}

/** The live featured trio (rank order) joined to `data/portfolio.ts` `pitchVideo`. */
export function featuredVideos(): FeaturedVideo[] {
  return projects
    .filter((project) => project.featured)
    .sort((a, b) => (a.featured ?? 0) - (b.featured ?? 0))
    .map((project) => ({
      slug: project.slug,
      pitchVideo: portfolioEntries.find((entry) => entry.slug === project.slug)?.pitchVideo,
    }));
}

/** Failure mode 3: every featured product has a valid pitch video id — production only (PB4). */
export function checkFeaturedVideos(vercelEnv: string | undefined, featured: readonly FeaturedVideo[] = featuredVideos()): PredeployIssue[] {
  if (vercelEnv !== "production") return [];

  const issues: PredeployIssue[] = [];
  for (const { slug, pitchVideo } of featured) {
    if (!pitchVideo) {
      issues.push({
        code: "video-missing",
        message: `featured product ${slug} has no pitchVideo in data/portfolio.ts (required at VERCEL_ENV=production, PB4)`,
      });
    } else if (!isValidVideoId(pitchVideo.provider, pitchVideo.videoId)) {
      issues.push({
        code: "video-invalid",
        message: `featured product ${slug}: "${pitchVideo.videoId}" is not a valid ${pitchVideo.provider} id (PB4)`,
      });
    }
  }
  return issues;
}

/** Failure mode 4: forbidden strings, via the shared scanner. */
export function checkForbiddenStrings(cwd: string): PredeployIssue[] {
  let codes: string[] | null;
  try {
    codes = readSandboxCodes(cwd);
  } catch (err) {
    // SF-3: a corrupt sandbox-code file is NOT "no codes" — the gate cannot verify, so it fails.
    return [{ code: "forbidden-scan-skipped", message: err instanceof Error ? err.message : String(err) }];
  }
  const result = scan({ cwd, sandboxCodes: codes ?? [], sandboxSkipped: codes === null });
  const hits: PredeployIssue[] = result.hits.map((hit) => ({
    code: "forbidden-string",
    message: `${hit.file}:${hit.line} → [${hit.pattern}] ${hit.match}`,
  }));
  // SF-1/SF-2 (fail closed): any path the scanner could not read leaves the tree UNVERIFIED — that is
  // a gate failure, never a quieter "0 hits in fewer files".
  const skipped: PredeployIssue[] = result.skipped.map((s) => ({
    code: "forbidden-scan-skipped",
    message: `cannot verify ${s.path} (${s.reason}) — forbidden-string scan is incomplete`,
  }));
  return [...hits, ...skipped];
}

export function runPredeployChecks(opts: PredeployOptions = {}): PredeployResult {
  const cwd = opts.cwd ?? process.cwd();
  const vercelEnv = opts.vercelEnv ?? process.env.VERCEL_ENV;

  const issues = [
    ...checkResume(cwd),
    ...checkFeaturedVideos(vercelEnv),
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
