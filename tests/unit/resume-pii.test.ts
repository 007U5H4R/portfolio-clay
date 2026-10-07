/**
 * resume-pii.test.ts (technical-plan.md §B TKT-08 S08r.01; TASK-175, 2026-10-07) - guards the resume.
 * The resume is Tushar's Google Drive file (`site.resumeUrl`), so NO resume PDF is committed to `public/`:
 *
 *   default (no RESUME_PATH)   -> asserts public/resume.pdf is absent and the URL is https on drive.google.com.
 *   RESUME_PATH set + exists   -> runs the PII gate (`pdftotext -layout` via `spawnSync`) over that scratch
 *                                 candidate, never committed. Fails CLOSED (does not skip) if the `pdftotext`
 *                                 binary cannot be found - an unverifiable PDF is never treated as clean.
 *
 * `RESUME_PATH="/Volumes/E Drive/Dev/.scratch/portfolio-clay/resume-candidate.pdf" pnpm test -t resume-pii`
 */
import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { site } from "@/lib/site";
import { PII_PATTERNS, RESUME_PII_PATTERNS } from "@/scripts/forbidden-strings";

const CANDIDATE = process.env.RESUME_PATH;
const RESUME_PATH = CANDIDATE ?? "public/resume.pdf";
const RESOLVED_PATH = resolve(process.cwd(), RESUME_PATH);
const DECISIONS_PATH = resolve(process.cwd(), "decisions.md");

// PII patterns the sanitised export must NOT contain.
// CR-005 / CR-008 (Stage 9): the canonical PII rules live in scripts/forbidden-strings.ts — this file
// previously carried a third, drifting hand-copy (2-digit-year DOB over-match; contiguous-only phone).
const { DOB: DOB_PATTERN, PHONE: PHONE_PATTERN, STREET_ADDRESS: STREET_ADDRESS_PATTERN } = PII_PATTERNS;

// Fixture-specific markers (technical-plan.md TKT-08 S08r.01): a value the sanitised PDF must
// retain, and a value it must have redacted, both fixed by that spec — not derived at runtime.
const MUST_CONTAIN = "429867";
const MUST_NOT_CONTAIN = "044152784";

function extractPdfText(pdfPath: string): string {
  const result = spawnSync("pdftotext", ["-layout", pdfPath, "-"], { encoding: "utf8" });
  if (result.error) {
    // Fail CLOSED: a PDF we cannot verify is never treated as PII-clean.
    throw new Error(
      `pdftotext is unavailable (${result.error.message}) — cannot verify ${pdfPath} for PII. ` +
        `Failing closed rather than skipping (A14: "pdftotext absent on Vercel build image").`,
    );
  }
  if (result.status !== 0) {
    throw new Error(
      `pdftotext exited ${result.status} on ${pdfPath}:\n${result.stderr || "(no stderr)"}`,
    );
  }
  return result.stdout;
}

async function decisionsHasResumeTitleException(): Promise<boolean> {
  if (!existsSync(DECISIONS_PATH)) return false;
  const contents = await readFile(DECISIONS_PATH, "utf8");
  // Split into `##`-level decision blocks (decisions.md format: one `##` heading per decision;
  // inner structure only ever uses `###`/bold, so this split can't accidentally merge blocks).
  const blocks = contents.split(/^## /m).slice(1);
  return blocks.some(
    (block) => /^EXE-/.test(block) && /resume title/i.test(block),
  );
}

const fileExists = existsSync(RESOLVED_PATH);

describe("resume guard (TASK-175)", () => {
  it("no resume PDF is committed to public/ (the resume is the Drive link)", () => {
    expect(existsSync(resolve(process.cwd(), "public/resume.pdf"))).toBe(false);
  });

  it("site.resumeUrl is https on drive.google.com", () => {
    const url = new URL(site.resumeUrl);
    expect(url.protocol).toBe("https:");
    expect(url.hostname).toBe("drive.google.com");
  });
});

describe("resume PII gate (TKT-08 S08r.01) - scratch candidate via RESUME_PATH", () => {
  if (!CANDIDATE || !fileExists) {
    it.skip("SKIP: set RESUME_PATH to a scratch PDF to run the PII gate (none is committed)", () => {});
    return;
  }

  // A file exists (e.g. via RESUME_PATH pointing at a scratch candidate) — run the real gate.
  // Extraction is attempted once, up front, but never thrown at collection time: a missing/broken
  // `pdftotext` must fail individual assertions (visible PASS/FAIL per case), not abort the file.
  let text: string;
  let extractionError: Error | null = null;
  try {
    text = extractPdfText(RESOLVED_PATH);
  } catch (err) {
    text = "";
    extractionError = err instanceof Error ? err : new Error(String(err));
  }

  function requireExtractedText(): string {
    if (extractionError) throw extractionError;
    return text;
  }

  it("contains no date-of-birth pattern", () => {
    expect(requireExtractedText(), "found what looks like a DOB (dd/mm/yyyy-style date)").not.toMatch(
      DOB_PATTERN,
    );
  });

  it("contains no +91 or bare 10-digit phone number", () => {
    expect(requireExtractedText(), "found what looks like a phone number").not.toMatch(PHONE_PATTERN);
  });

  it("contains no street-address keywords", () => {
    expect(
      requireExtractedText(),
      "found a street-address keyword (Road/Street/Nagar/Layout/Apartment/Flat No)",
    ).not.toMatch(STREET_ADDRESS_PATTERN);
  });

  // SEC-001 (Stage 10): the real PDF must also clear the résumé-only superset (ISO/textual DOB,
  // international/parenthesised/spaced phones, Western street keywords, labelled postal codes) —
  // the same rules `scanResumePii` enforces at `prebuild`, so this test and the deploy gate agree.
  for (const { name, re } of RESUME_PII_PATTERNS) {
    it(`contains no ${name} (SEC-001 superset)`, () => {
      expect(requireExtractedText(), `found what looks like a ${name}`).not.toMatch(re);
    });
  }

  it(`contains the required marker "${MUST_CONTAIN}"`, () => {
    expect(requireExtractedText()).toContain(MUST_CONTAIN);
  });

  it(`does not contain the redacted marker "${MUST_NOT_CONTAIN}"`, () => {
    expect(requireExtractedText()).not.toContain(MUST_NOT_CONTAIN);
  });

  it(`contains the resume title "${site.title}" (or decisions.md records an EXE- exception)`, async () => {
    const extracted = requireExtractedText();
    if (extracted.includes(site.title)) return;
    const hasException = await decisionsHasResumeTitleException();
    expect(
      hasException,
      `resume text does not contain "${site.title}" and decisions.md has no EXE- block ` +
        'mentioning "resume title" to record the accepted mismatch',
    ).toBe(true);
  });
});
