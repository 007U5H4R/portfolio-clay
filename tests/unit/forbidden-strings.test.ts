import { afterAll, describe, expect, it } from "vitest";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { scan } from "@/scripts/forbidden-strings";

/**
 * The repo (and, in CI, the bundle) must be clean; planting a banned string must be caught.
 * Temp trees live on the E Drive scratch area (never the internal disk — machine constraint).
 */
const SCRATCH = "/Volumes/E Drive/Dev/.scratch";
mkdirSync(SCRATCH, { recursive: true });
const tmps: string[] = [];
const tmp = () => {
  const d = mkdtempSync(join(SCRATCH, "forbidden-"));
  tmps.push(d);
  return d;
};

afterAll(() => {
  for (const d of tmps) rmSync(d, { recursive: true, force: true });
});

describe("scripts/forbidden-strings", () => {
  it("finds 0 hits in the real repo source", () => {
    const result = scan();
    expect(result.hits, JSON.stringify(result.hits, null, 2)).toEqual([]);
    expect(result.filesScanned).toBeGreaterThan(0);
  });

  it("catches a planted PMP credential in data/**", () => {
    const dir = tmp();
    mkdirSync(join(dir, "data"), { recursive: true });
    writeFileSync(join(dir, "data", "evil.ts"), "export const cert = 'PMP';\n");
    const result = scan({ cwd: dir });
    expect(result.hits.some((h) => h.pattern === "PMP")).toBe(true);
  });

  it("catches a 10-digit phone only inside data/content, not app", () => {
    const dir = tmp();
    mkdirSync(join(dir, "data"), { recursive: true });
    mkdirSync(join(dir, "app"), { recursive: true });
    writeFileSync(join(dir, "data", "d.ts"), "const p = '9876543210';\n");
    writeFileSync(join(dir, "app", "a.ts"), "const id = '1234567890';\n");
    const result = scan({ cwd: dir });
    const phoneHits = result.hits.filter((h) => h.pattern === "phone 10-digit");
    expect(phoneHits).toHaveLength(1);
    expect(phoneHits[0]?.file.startsWith("data/")).toBe(true);
  });

  it("catches the sandbox join code when supplied, and never hard-codes it", () => {
    const dir = tmp();
    mkdirSync(join(dir, "data"), { recursive: true });
    const code = "TMP-JOIN-9F2X"; // synthetic, test-only
    writeFileSync(join(dir, "data", "d.ts"), `const join = '${code}';\n`);
    const result = scan({ cwd: dir, sandboxCodes: [code] });
    expect(result.hits.some((h) => h.pattern === "sandbox join code")).toBe(true);
  });
});
