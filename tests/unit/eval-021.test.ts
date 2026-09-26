import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { ILLUSTRATIONS } from "@/content/media/illustrations/manifest";
import { contentForbiddenHits, PII_PATTERNS } from "@/scripts/forbidden-strings";

/**
 * EVAL-021 — illustration provenance, both ways (S20; TKT-73 S73.04; TC-138, TC-142).
 *
 * `scripts/eval.ts` maps EVAL-021 to this file by name (generic Vitest mapping, F1-5), so the
 * status `pnpm eval --only EVAL-021` reports is this file's pass/fail — nothing hand-entered.
 * `check()` is a pure function run twice: once against the real tree (expects 0 findings) and once
 * against each one-sided fixture under `tests/fixtures/illustrations-onesided/` (expects ≥ 1).
 */

const ROOT = process.cwd();
const CONTENT_DIR = join(ROOT, "content", "media", "illustrations");
const PUBLIC_DIR = join(ROOT, "public");
const FIXTURES_DIR = join(ROOT, "tests", "fixtures", "illustrations-onesided");

interface Finding {
  rule: string;
  detail: string;
}

interface ManifestLike {
  id: string;
  kind: string;
  file: string;
  publicSrc?: string;
  alt: string;
  usedOn: string[];
}

/** Recursively list files under `dir`, relative to `dir`, POSIX-separated, excluding `exclude`. */
function listFiles(dir: string, exclude: Set<string>): string[] {
  const out: string[] = [];
  if (!existsSync(dir)) return out;
  const walk = (sub: string) => {
    for (const entry of readdirSync(join(dir, sub), { withFileTypes: true })) {
      const relPath = sub ? `${sub}/${entry.name}` : entry.name;
      if (exclude.has(relPath)) continue;
      if (entry.isDirectory()) {
        walk(relPath);
      } else {
        out.push(relPath);
      }
    }
  };
  walk("");
  return out;
}

/** Parse the `id | file | kind | model | ... | used on | sha256` provenance table into id → non-empty-cell-count. */
function readmeRowsById(readme: string): Map<string, string[]> {
  const rows = new Map<string, string[]>();
  for (const line of readme.split("\n")) {
    if (!line.trim().startsWith("|")) continue;
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim());
    if (cells.length < 2) continue;
    const idCell = cells[0];
    if (!idCell || idCell === "id" || /^-+$/.test(idCell)) continue; // header / separator
    rows.set(idCell.replace(/`/g, ""), cells);
  }
  return rows;
}

const ALT_PREFIXES: Record<string, string[]> = {
  scene: ["Illustration of "],
  poster: ["Illustration of "],
  clip: ["Animated illustration of "],
  reference: ["Illustration reference sheet"],
};

/**
 * The both-ways provenance check (Design.md §6.1/§6.2, TC-138 steps 1–4). `dir` is the folder that
 * holds the assets (excluding `README.md`/`manifest.ts`, `reference/` included); `entries` is the
 * manifest; `readme` is the provenance README text.
 */
export function check(dir: string, entries: ManifestLike[], readme: string): Finding[] {
  const findings: Finding[] = [];

  // Rule 1 — every on-disk file (excluding README.md, manifest.ts) has exactly one manifest entry, and vice versa.
  const filesOnDisk = new Set(listFiles(dir, new Set(["README.md", "manifest.ts"])));
  const filesInManifest = new Set(entries.map((e) => e.file).filter((f) => f.length > 0));
  for (const f of filesOnDisk) {
    if (!filesInManifest.has(f)) findings.push({ rule: "orphan-file", detail: f });
  }
  for (const f of filesInManifest) {
    if (!filesOnDisk.has(f)) findings.push({ rule: "orphan-entry-file", detail: f });
  }

  // Rule 2 — every entry id has a README row with all columns non-empty.
  const rows = readmeRowsById(readme);
  for (const entry of entries) {
    const row = rows.get(entry.id);
    if (!row) {
      findings.push({ rule: "missing-readme-row", detail: entry.id });
      continue;
    }
    if (row.some((cell) => cell.length === 0)) {
      findings.push({ rule: "empty-readme-cell", detail: entry.id });
    }
  }

  // Rule 3 — alt prefix per kind; character-sheet-b (reference) usedOn === [].
  for (const entry of entries) {
    const prefixes = ALT_PREFIXES[entry.kind] ?? [];
    if (!prefixes.some((p) => entry.alt.startsWith(p))) {
      findings.push({ rule: "bad-alt-prefix", detail: entry.id });
    }
    if (entry.kind === "reference" && entry.usedOn.length > 0) {
      findings.push({ rule: "reference-used-on-not-empty", detail: entry.id });
    }
  }

  // Rule 4 — filenames + alts through forbidden-strings + PII.
  for (const entry of entries) {
    const text = `${entry.file} ${entry.alt}`;
    if (contentForbiddenHits(text).length > 0) {
      findings.push({ rule: "forbidden-string", detail: entry.id });
    }
    if (Object.values(PII_PATTERNS).some((re) => re.test(text))) {
      findings.push({ rule: "pii", detail: entry.id });
    }
  }

  return findings;
}

describe("EVAL-021 — illustration provenance (both ways)", () => {
  const readme = readFileSync(join(CONTENT_DIR, "README.md"), "utf8");

  it("the real tree has zero findings", () => {
    const findings = check(CONTENT_DIR, ILLUSTRATIONS as unknown as ManifestLike[], readme);
    expect(findings).toEqual([]);
  });

  it("every manifest id matches the ten ids (§6.1 nine + `hero-banner`, Dev-23 / TKT-93)", () => {
    expect(ILLUSTRATIONS.map((e) => e.id).sort()).toEqual(
      [
        "character-sheet-b",
        "hero-banner",
        "hero-clip",
        "hero-desk",
        "scene-about",
        "scene-casestudy",
        "scene-contact",
        "scene-playground",
        "scene-thinking",
        "scene-work",
      ].sort(),
    );
    expect(ILLUSTRATIONS.length).toBe(10);
  });

  it("hero-banner is the 3168×1344 outpaint with the Dev-23 alt, used on / (TKT-93)", () => {
    const banner = ILLUSTRATIONS.find((e) => e.id === "hero-banner")!;
    expect(banner.file).toBe("hero-banner.webp");
    expect([banner.width, banner.height]).toEqual([3168, 1344]);
    expect(banner.alt).toBe(
      "Illustration of Tushar at a warm desk — laptop, notebook, plants, a lamp, a sleeping golden retriever, blank pinned notes, and books titled Product Thinking, AI & Society, System Thinking and A Better Tomorrow.",
    );
    expect(banner.usedOn).toEqual(["/"]);
    // The three polaroid scenes declare the home route too (they render there as decorative crops).
    for (const id of ["scene-work", "scene-about", "scene-playground"]) {
      expect(ILLUSTRATIONS.find((e) => e.id === id)!.usedOn, id).toContain("/");
    }
  });

  it("publicSrc files exist under public/", () => {
    for (const entry of ILLUSTRATIONS) {
      if (!entry.publicSrc) continue;
      const full = join(PUBLIC_DIR, entry.publicSrc.replace(/^\//, ""));
      expect(existsSync(full), `${entry.id} publicSrc ${entry.publicSrc} missing`).toBe(true);
    }
  });

  it("content/media/illustrations/hero-desk.webp and public/media/illustrations/hero-poster.webp are byte-identical", () => {
    const a = readFileSync(join(CONTENT_DIR, "hero-desk.webp"));
    const b = readFileSync(join(PUBLIC_DIR, "media", "illustrations", "hero-poster.webp"));
    const shaA = createHash("sha256").update(a).digest("hex");
    const shaB = createHash("sha256").update(b).digest("hex");
    expect(shaA).toBe(shaB);
  });

  it("one-sided fixture: extra file without a manifest entry yields >= 1 finding", () => {
    const dir = join(FIXTURES_DIR, "extra-file");
    const findings = check(dir, [], "| id | file | kind | model | reference media ids | prompt summary | generated | credits spent | used on |\n|---|---|---|---|---|---|---|---|---|\n");
    expect(findings.length).toBeGreaterThanOrEqual(1);
    expect(findings.some((f) => f.rule === "orphan-file")).toBe(true);
  });

  it("one-sided fixture: manifest entry without a file yields >= 1 finding", () => {
    const dir = join(FIXTURES_DIR, "missing-file");
    const entries: ManifestLike[] = [
      {
        id: "fixture-missing",
        kind: "scene",
        file: "missing.jpg",
        alt: "Illustration of a fixture asset that does not exist on disk.",
        usedOn: [],
      },
    ];
    const readmeFixture =
      "| id | file | kind | model | reference media ids | prompt summary | generated | credits spent | used on |\n" +
      "|---|---|---|---|---|---|---|---|---|\n" +
      "| `fixture-missing` | missing.jpg | scene | test | test | test | 2026-01-01 | 1 | test |\n";
    const findings = check(dir, entries, readmeFixture);
    expect(findings.length).toBeGreaterThanOrEqual(1);
    expect(findings.some((f) => f.rule === "orphan-entry-file")).toBe(true);
  });
});
