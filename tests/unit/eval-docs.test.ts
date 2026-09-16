/**
 * eval-docs.test.ts (technical-plan.md §B S12.03) — keeps `docs/eval.md` honest about the runner.
 * Every flag printed by `pnpm eval --help` must be documented, so the doc can never drift behind
 * the orchestrator's actual interface.
 */
import { describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = process.cwd();

describe("docs/eval.md", () => {
  it("documents every flag that `pnpm eval --help` prints", () => {
    const help = spawnSync("pnpm", ["exec", "tsx", "scripts/eval.ts", "--help"], {
      cwd: ROOT,
      encoding: "utf8",
    });
    expect(help.status).toBe(0);
    const flags = [...new Set((help.stdout ?? "").match(/--[a-z][a-z-]+/g) ?? [])];
    expect(flags.length).toBeGreaterThanOrEqual(5);

    const doc = readFileSync(resolve(ROOT, "docs/eval.md"), "utf8");
    const missing = flags.filter((f) => !doc.includes(f));
    expect(missing, `docs/eval.md is missing flags: ${missing.join(", ")}`).toEqual([]);
  }, 60_000); // spawns a cold `tsx --help`; generous timeout under orchestrator load (Vitest default is 5 s)
});
