import { describe, expect, it } from "vitest";
import type { KnowledgeEntry } from "@/data/schema";
import { knowledge } from "@/data/knowledge";
import { FALLBACK, LocalKnowledgeProvider } from "@/lib/ask/local-provider";

/**
 * LocalKnowledgeProvider matching (technical-plan.md §A4 steps 3–5). Deterministic: exact prompt →
 * score 1; paraphrase routed by weighted canonical keywords; ties broken by array order; below
 * threshold or zero canonical tokens → the graceful empty answer (never a fabricated one).
 */
const provider = new LocalKnowledgeProvider(knowledge);

function mock(id: string): KnowledgeEntry {
  return {
    id,
    prompt: `prompt ${id}`,
    aliases: [],
    keywords: [
      { term: "ai", weight: 2 },
      { term: "built", weight: 1 },
    ],
    answer: `Answer for ${id} — at least forty characters long for the schema.`,
    evidence: [
      { label: "One", href: "/work" },
      { label: "Two", href: "/about" },
    ],
    sources: [{ id: "S", label: "src", ref: "x", inventory: "§9" }],
    draft: true,
    surface: ["home"],
  };
}

describe("LocalKnowledgeProvider", () => {
  it("returns score 1 and the exact entry for an exact prompt", async () => {
    const a = await provider.ask("What products have you built?");
    expect(a.kind).toBe("answer");
    if (a.kind !== "answer") throw new Error("expected answer");
    expect(a.matched).toEqual(["built"]);
    expect(a.score).toBe(1);
    expect(a.text).toBe(knowledge.find((k) => k.id === "built")!.answer);
  });

  it("routes a paraphrase to the AI-products entry", async () => {
    const a = await provider.ask("which AI things did you build");
    expect(a.kind).toBe("answer");
    if (a.kind !== "answer") throw new Error("expected answer");
    expect(a.matched).toEqual(["ai-products"]);
  });

  it("breaks a tie by array order (first entry wins)", () => {
    const p = new LocalKnowledgeProvider([mock("first"), mock("second")]);
    const a = p.answerFor("which ai did you build"); // matches both identically
    expect(a.kind).toBe("answer");
    if (a.kind !== "answer") throw new Error("expected answer");
    expect(a.matched).toEqual(["first"]);
  });

  it("returns empty below the threshold", () => {
    // One low-weight keyword hit (ai:1 of total 3 = 0.33) stays under the 0.34 threshold.
    const p = new LocalKnowledgeProvider([
      { ...mock("solo"), keywords: [{ term: "ai", weight: 1 }, { term: "built", weight: 2 }] },
    ]);
    const a = p.answerFor("ai");
    expect(a.kind).toBe("empty");
  });

  it("returns empty + up to 3 suggestions for a query with no canonical tokens", () => {
    const a = provider.answerFor("weather in paris", { surface: "home" });
    expect(a.kind).toBe("empty");
    if (a.kind !== "empty") throw new Error("expected empty");
    expect(a.text).toBe(FALLBACK);
    expect(a.evidence).toEqual([]);
    expect(a.suggestions).toHaveLength(3);
  });

  it("suggestionsFor filters by surface and excludes the query", () => {
    const home = provider.suggestionsFor("home");
    expect(home).toHaveLength(3);
    const panel = provider.suggestionsFor("panel");
    expect(panel.length).toBe(3);
    // home and panel prompt sets are disjoint.
    expect(home.some((p) => panel.includes(p))).toBe(false);
  });

  it("respects a custom threshold", () => {
    const strict = new LocalKnowledgeProvider(knowledge, { threshold: 1.01 });
    // Even an exact match (score 1) falls below an impossible threshold → empty.
    const a = strict.answerFor("What products have you built?");
    expect(a.kind).toBe("empty");
  });
});
