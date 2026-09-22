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

const SCRATCH = "/Volumes/E Drive/Dev/.scratch";
mkdirSync(SCRATCH, { recursive: true });
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
