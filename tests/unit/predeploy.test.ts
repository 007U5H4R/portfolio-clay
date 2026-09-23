/**
 * predeploy.test.ts (TKT-50 AC8) — proves every predeploy-check.ts failure mode actually fires,
 * and that today's clean repo state passes. Temp trees live on the E Drive scratch area (never
 * the internal disk — machine constraint), following the same pattern as forbidden-strings.test.ts.
 */
import { afterAll, describe, expect, it } from "vitest";
import { chmodSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  checkFeaturedVideos,
  checkForbiddenStrings,
  checkResume,
  runPredeployChecks,
  scanResumePii,
} from "@/scripts/predeploy-check";
import { scratchDir } from "./scratch-dir";

// CR-004 (Stage 9): E Drive locally, OS tmpdir on CI — the hard-coded macOS path failed with EACCES
// at module load on a Linux runner (see scratch-dir.ts).
const SCRATCH = scratchDir();
const tmps: string[] = [];
const tmp = () => {
  const d = mkdtempSync(join(SCRATCH, "predeploy-"));
  tmps.push(d);
  return d;
};

afterAll(() => {
  for (const d of tmps) rmSync(d, { recursive: true, force: true });
});

/** Writes an executable fake `pdftotext` into `dir` that ignores its args and prints `$FAKE_TEXT`. */
function fakePdftotext(dir: string): void {
  writeFileSync(join(dir, "pdftotext"), `#!/bin/sh\nprintf '%s' "$FAKE_TEXT"\n`);
  chmodSync(join(dir, "pdftotext"), 0o755);
}

/** Writes an executable fake `pdftotext` that always exits non-zero (simulates a corrupt PDF). */
function fakeFailingPdftotext(dir: string): void {
  writeFileSync(join(dir, "pdftotext"), `#!/bin/sh\nexit 2\n`);
  chmodSync(join(dir, "pdftotext"), 0o755);
}

describe("scanResumePii (fail-closed PII extraction)", () => {
  it("FAILS CLOSED when pdftotext cannot be found on PATH", () => {
    const dir = tmp(); // empty dir on PATH — no pdftotext binary present
    const result = scanResumePii("irrelevant.pdf", { ...process.env, PATH: dir });
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/cannot verify PDF.*pdftotext is unavailable/);
  });

  it("FAILS CLOSED when pdftotext exits non-zero (unreadable/corrupt PDF)", () => {
    const dir = tmp();
    fakeFailingPdftotext(dir);
    const result = scanResumePii("irrelevant.pdf", { ...process.env, PATH: dir });
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/cannot verify PDF.*exited 2/);
  });

  it("fires on a DOB pattern", () => {
    const dir = tmp();
    fakePdftotext(dir);
    const result = scanResumePii("irrelevant.pdf", { ...process.env, PATH: dir, FAKE_TEXT: "Born 12/05/1990 in Bengaluru" });
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/DOB/);
  });

  it("fires on a phone-number pattern", () => {
    const dir = tmp();
    fakePdftotext(dir);
    const result = scanResumePii("irrelevant.pdf", { ...process.env, PATH: dir, FAKE_TEXT: "Call 9876543210" });
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/phone/);
  });

  // CR-005 (Stage 9): this file's old hand-copied phone rule matched only 10 CONTIGUOUS digits, so the
  // spaced/dashed +91 form a résumé actually prints slipped through the production gate.
  it("fires on a SPACED +91 phone number (the canonical PII rule, not the drifted copy)", () => {
    const dir = tmp();
    fakePdftotext(dir);
    const result = scanResumePii("irrelevant.pdf", {
      ...process.env,
      PATH: dir,
      FAKE_TEXT: "Reach me at +91 98765 43210",
    });
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/phone/);
  });

  // SEC-001 (Stage 10): the gate was format-narrow — every one of these forms previously PASSED it.
  // One case per résumé-only rule so a future regex edit that drops a form fails visibly.
  const SEC001_FORMS: Array<[label: string, text: string, reason: RegExp]> = [
    ["ISO DOB", "Born 1990-05-12", /DOB/],
    ["textual-month DOB (day first)", "Born 12 May 1990", /DOB/],
    ["textual-month DOB (month first)", "DOB: May 12, 1990", /DOB/],
    ["international +cc phone", "Mobile +1 (415) 555-0123", /phone/],
    ["parenthesised area-code phone", "Call (415) 555-0123", /phone/],
    ["spaced Indian mobile without +91", "Mobile 98765 43210", /phone/],
    ["dashed Indian mobile", "Mobile 98765-43210", /phone/],
    ["Western street keyword", "42 Elm Avenue", /street-address/],
    ["labelled postal code", "Bengaluru, PIN 560001", /postal-code/],
  ];
  for (const [label, text, reason] of SEC001_FORMS) {
    it(`fires on a ${label} (SEC-001)`, () => {
      const dir = tmp();
      fakePdftotext(dir);
      const result = scanResumePii("irrelevant.pdf", { ...process.env, PATH: dir, FAKE_TEXT: text });
      expect(result.ok, text).toBe(false);
      expect(result.reason, text).toMatch(reason);
    });
  }

  // …and the broader rules must NOT false-positive on the things a clean résumé legitimately says:
  // year ranges (hyphen and en-dash), a 6-digit patent number, counts like "7+ years".
  it("passes a clean résumé with date ranges, a patent number and counts (SEC-001 negative fixture)", () => {
    const dir = tmp();
    fakePdftotext(dir);
    const result = scanResumePii("irrelevant.pdf", {
      ...process.env,
      PATH: dir,
      FAKE_TEXT:
        "Tushar Pathak — Senior Product Manager · Quantiphi 2022-2026 · Godrej Sep 2016 – Dec 2018 · Patent 429867 · 7+ years · 40+ capabilities · Bengaluru, India",
    });
    expect(result.reason ?? "").toBe("");
    expect(result.ok).toBe(true);
  });

  it("fires on a street-address keyword", () => {
    const dir = tmp();
    fakePdftotext(dir);
    const result = scanResumePii("irrelevant.pdf", { ...process.env, PATH: dir, FAKE_TEXT: "12 MG Road, Flat No 4" });
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/street-address/);
  });

  it("passes on clean text", () => {
    const dir = tmp();
    fakePdftotext(dir);
    const result = scanResumePii("irrelevant.pdf", {
      ...process.env,
      PATH: dir,
      FAKE_TEXT: "Tushar Pathak — Senior Product Manager",
    });
    expect(result.ok).toBe(true);
  });
});

describe("checkResume (PB5: resumeAvailable / PII invariant)", () => {
  it("PASSES when resume.pdf is absent and resumeAvailable is false (today's real state)", () => {
    const dir = tmp();
    const issues = checkResume(dir, { resumeAvailable: false });
    expect(issues).toEqual([]);
  });

  it("FAILS: resumeAvailable is true but no resume.pdf exists", () => {
    const dir = tmp();
    const issues = checkResume(dir, { resumeAvailable: true });
    expect(issues).toHaveLength(1);
    expect(issues[0]?.code).toBe("resume-missing");
  });

  it("FAILS: resume.pdf exists but its PII scan fails", () => {
    const dir = tmp();
    mkdirSync(join(dir, "public"), { recursive: true });
    writeFileSync(join(dir, "public", "resume.pdf"), "not a real pdf");
    const issues = checkResume(dir, {
      resumeAvailable: true,
      scanPii: () => ({ ok: false, reason: "resume PDF matches a DOB pattern" }),
    });
    expect(issues).toHaveLength(1);
    expect(issues[0]?.code).toBe("resume-pii");
    expect(issues[0]?.message).toMatch(/DOB pattern/);
  });

  it("PASSES when resume.pdf exists and its PII scan is clean", () => {
    const dir = tmp();
    mkdirSync(join(dir, "public"), { recursive: true });
    writeFileSync(join(dir, "public", "resume.pdf"), "not a real pdf");
    const issues = checkResume(dir, { resumeAvailable: true, scanPii: () => ({ ok: true }) });
    expect(issues).toEqual([]);
  });
});

describe("checkFeaturedVideos (PB4: production-only)", () => {
  it("does NOT fail a non-production run even with all videos missing", () => {
    const dir = tmp();
    expect(checkFeaturedVideos(dir, "preview")).toEqual([]);
    expect(checkFeaturedVideos(dir, undefined)).toEqual([]);
  });

  it("FAILS in production when a featured video is missing", () => {
    const dir = tmp();
    const issues = checkFeaturedVideos(dir, "production");
    expect(issues).toHaveLength(3);
    expect(issues.every((i) => i.code === "video-missing")).toBe(true);
    expect(issues.map((i) => i.message).join("\n")).toMatch(/teachspark\.mp4/);
    expect(issues.map((i) => i.message).join("\n")).toMatch(/railcite\.mp4/);
    expect(issues.map((i) => i.message).join("\n")).toMatch(/velora\.mp4/);
  });

  it("FAILS in production when a featured video exceeds 4 MB", () => {
    const dir = tmp();
    mkdirSync(join(dir, "public", "video"), { recursive: true });
    writeFileSync(join(dir, "public", "video", "teachspark.mp4"), Buffer.alloc(4 * 1024 * 1024 + 1));
    writeFileSync(join(dir, "public", "video", "railcite.mp4"), Buffer.alloc(1024));
    writeFileSync(join(dir, "public", "video", "velora.mp4"), Buffer.alloc(1024));
    const issues = checkFeaturedVideos(dir, "production");
    expect(issues).toHaveLength(1);
    expect(issues[0]?.code).toBe("video-too-large");
    expect(issues[0]?.message).toMatch(/teachspark\.mp4/);
  });

  it("PASSES in production when all videos exist and are within budget", () => {
    const dir = tmp();
    mkdirSync(join(dir, "public", "video"), { recursive: true });
    for (const name of ["teachspark", "railcite", "velora"]) {
      writeFileSync(join(dir, "public", "video", `${name}.mp4`), Buffer.alloc(1024));
    }
    expect(checkFeaturedVideos(dir, "production")).toEqual([]);
  });
});

describe("checkForbiddenStrings (delegates to scripts/forbidden-strings.ts)", () => {
  it("PASSES on a clean tree", () => {
    const dir = tmp();
    expect(checkForbiddenStrings(dir)).toEqual([]);
  });

  it("FAILS when a forbidden string is planted", () => {
    const dir = tmp();
    mkdirSync(join(dir, "data"), { recursive: true });
    writeFileSync(join(dir, "data", "evil.ts"), "export const cert = 'PMP';\n");
    const issues = checkForbiddenStrings(dir);
    expect(issues.some((i) => i.code === "forbidden-string" && /PMP/.test(i.message))).toBe(true);
  });

  // SF-1 / SF-2 (Stage 9, fail closed): an UNREADABLE directory inside a scanned category used to be
  // silently dropped, so the gate reported "0 hits" over a tree it never fully read. chmod 000 does
  // not restrict root, so the case is skipped (not faked) when the runner is root.
  it.skipIf(process.getuid?.() === 0)("FAILS when part of the tree is unreadable (scan cannot verify it)", () => {
    const dir = tmp();
    const locked = join(dir, "data", "locked");
    mkdirSync(locked, { recursive: true });
    writeFileSync(join(locked, "hidden.ts"), "export const x = 1;\n");
    chmodSync(locked, 0o000);
    try {
      const issues = checkForbiddenStrings(dir);
      expect(issues.some((i) => i.code === "forbidden-scan-skipped" && /locked/.test(i.message))).toBe(true);
    } finally {
      chmodSync(locked, 0o755); // so afterAll's rmSync can clean it up
    }
  });

  // SF-3: a PRESENT-but-malformed sandbox-code file previously parsed to `[]` — i.e. "verified zero
  // codes", with no SKIP line. It is a misconfiguration the gate cannot see through, so it must fail.
  it("FAILS when tests/forbidden.local.json exists but is malformed (never 'zero codes')", () => {
    const dir = tmp();
    mkdirSync(join(dir, "tests"), { recursive: true });
    writeFileSync(join(dir, "tests", "forbidden.local.json"), "{ not json");
    const issues = checkForbiddenStrings(dir);
    expect(issues.some((i) => i.code === "forbidden-scan-skipped" && /malformed/.test(i.message))).toBe(true);
  });

  it("PASSES when tests/forbidden.local.json is simply absent (the documented SKIP path)", () => {
    const dir = tmp();
    expect(checkForbiddenStrings(dir)).toEqual([]);
  });
});

describe("runPredeployChecks (integration)", () => {
  it("PASSES against the real repo's current clean state (no resume.pdf, no videos, non-production)", () => {
    const result = runPredeployChecks({ cwd: process.cwd(), vercelEnv: "test-non-production" });
    expect(result.issues, JSON.stringify(result.issues, null, 2)).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it("aggregates every failing check", () => {
    const dir = tmp();
    mkdirSync(join(dir, "data"), { recursive: true });
    writeFileSync(join(dir, "data", "evil.ts"), "export const cert = 'PMP';\n");
    const result = runPredeployChecks({ cwd: dir, vercelEnv: "production" });
    expect(result.ok).toBe(false);
    const codes = result.issues.map((i) => i.code).sort();
    expect(codes).toEqual(["forbidden-string", "video-missing", "video-missing", "video-missing"].sort());
  });
});
