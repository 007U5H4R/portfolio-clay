import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { ILLUSTRATIONS } from "@/content/media/illustrations/manifest";

/**
 * EVAL-025 — dark-art pairing (S23, EV9). Seeded in TASK-140 with the first pair (`hero-banner`); every
 * later theme-sensitive scene adds its `darkFile` to the manifest and is covered by the same pure `check()`.
 * One manifest entry per pair, per-theme src, one shared alt, identical pixel dimensions, both files under
 * the 350 kB scene cap, and a README row for the dark file that names its light twin.
 */

const CONTENT_DIR = join(process.cwd(), "content", "media", "illustrations");
const SCENE_CAP_BYTES = 350 * 1024;

interface PairEntry {
  id: string;
  file: string;
  darkFile?: string;
  width: number;
  height: number;
}
interface Finding {
  rule: string;
  detail: string;
}
type Size = { width: number; height: number };

/** Pure: findings for every paired entry. `sizeOf`/`bytesOf` are injected so one-sided fixtures need no files. */
export function check(entries: PairEntry[], readme: string, sizeOf: (file: string) => Size | undefined, bytesOf: (file: string) => number | undefined): Finding[] {
  const findings: Finding[] = [];
  for (const entry of entries) {
    if (!entry.darkFile) continue;
    const light = sizeOf(entry.file);
    const dark = sizeOf(entry.darkFile);
    if (!dark) findings.push({ rule: "missing-dark-file", detail: entry.id });
    if (!light) findings.push({ rule: "missing-light-file", detail: entry.id });
    if (light && dark && (light.width !== dark.width || light.height !== dark.height)) findings.push({ rule: "dimension-mismatch", detail: entry.id });
    if (light && (light.width !== entry.width || light.height !== entry.height)) findings.push({ rule: "manifest-size-mismatch", detail: entry.id });
    for (const file of [entry.file, entry.darkFile]) {
      const bytes = bytesOf(file);
      if (bytes !== undefined && bytes > SCENE_CAP_BYTES) findings.push({ rule: "over-cap", detail: `${entry.id}: ${file} ${bytes}` });
    }
    const row = readme.split("\n").find((line) => line.startsWith(`| \`${entry.id}-dark\` |`) || line.includes(`\`${entry.darkFile}\``) && line.trim().startsWith("|"));
    if (!row) findings.push({ rule: "missing-dark-readme-row", detail: entry.id });
    else if (!row.includes(`\`${entry.id}\``)) findings.push({ rule: "readme-row-names-no-light-twin", detail: entry.id });
  }
  return findings;
}

describe("EVAL-025 — dark-art pairing", () => {
  const readme = readFileSync(join(CONTENT_DIR, "README.md"), "utf8");
  const paired = ILLUSTRATIONS.filter((e) => e.darkFile);

  it("hero-banner is paired (the first pair, TASK-140)", () => {
    expect(paired.map((e) => e.id)).toContain("hero-banner");
  });

  it("the real tree has zero findings", async () => {
    const sizes = new Map<string, Size>();
    for (const entry of paired) {
      for (const file of [entry.file, entry.darkFile!]) {
        const full = join(CONTENT_DIR, file);
        if (!existsSync(full)) continue;
        const meta = await sharp(full).metadata();
        sizes.set(file, { width: meta.width!, height: meta.height! });
      }
    }
    const findings = check(
      paired as unknown as PairEntry[],
      readme,
      (file) => sizes.get(file),
      (file) => (existsSync(join(CONTENT_DIR, file)) ? statSync(join(CONTENT_DIR, file)).size : undefined),
    );
    expect(findings).toEqual([]);
  });

  describe("one-sided fixtures each fail", () => {
    const pair: PairEntry = { id: "fixture", file: "a.webp", darkFile: "a-dark.webp", width: 100, height: 50 };
    const readmeOk = "| `fixture-dark` | `a-dark.webp` (dark twin of `fixture`) |";
    const size100 = () => ({ width: 100, height: 50 });
    it("a missing dark file", () => {
      const f = check([pair], readmeOk, (file) => (file === "a-dark.webp" ? undefined : size100()), () => 10);
      expect(f.some((x) => x.rule === "missing-dark-file")).toBe(true);
    });
    it("different dimensions", () => {
      const f = check([pair], readmeOk, (file) => (file === "a-dark.webp" ? { width: 99, height: 50 } : size100()), () => 10);
      expect(f.some((x) => x.rule === "dimension-mismatch")).toBe(true);
    });
    it("over the cap", () => {
      const f = check([pair], readmeOk, size100, () => SCENE_CAP_BYTES + 1);
      expect(f.some((x) => x.rule === "over-cap")).toBe(true);
    });
    it("no README row, or a row that names no light twin", () => {
      expect(check([pair], "", size100, () => 10).some((x) => x.rule === "missing-dark-readme-row")).toBe(true);
      expect(check([pair], "| `fixture-dark` | `a-dark.webp` |", size100, () => 10).some((x) => x.rule === "readme-row-names-no-light-twin")).toBe(true);
    });
  });
});
