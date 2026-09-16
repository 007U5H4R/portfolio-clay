import { describe, expect, it } from "vitest";
import { collections, validateAll } from "@/data/index";
import type { Project } from "@/data/schema";
import { invalidProject } from "@/tests/fixtures/invalid-project.fixture";

/**
 * The deliberate failing fixture drives EVAL-013: `validateAll()` must reject it with exactly the
 * three planted issues (metric missing asOf, empty sources, banned statusLabel) — no more, no fewer.
 */
describe("content gate — deliberate failing fixture", () => {
  const result = validateAll({ ...collections, projects: [invalidProject as unknown as Project] });

  it("fails validation", () => {
    expect(result.ok).toBe(false);
  });

  it("reports exactly the three planted issue paths", () => {
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issues).toHaveLength(3);

    const hasPath = (needle: string) => result.issues.some((i) => i.includes(needle));
    expect(hasPath("metrics.0.asOf"), "metric missing asOf").toBe(true);
    expect(hasPath("→ sources:"), "empty sources").toBe(true);
    expect(hasPath("statusLabel: forbidden content"), "banned statusLabel").toBe(true);
  });
});
