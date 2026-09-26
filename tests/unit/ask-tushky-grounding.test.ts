import { describe, expect, it } from "vitest";
import { knowledge } from "@/data/knowledge";
import { LocalKnowledgeProvider } from "@/lib/ask/local-provider";
import {
  FOLLOW_UP_LABELS,
  TUSHKY_SUGGESTIONS,
  followUpsFor,
  followUpsForPrompts,
} from "@/components/ai/ask-tushky-data";

/**
 * TKT-104 r2 (Design.md §11 Dev-63; EVAL-012 unchanged). Every question the Ask Tushky drawer offers,
 * whether a suggestion card or a follow-up chip, must resolve to a sourced answer from the retrieval
 * index and never to the empty fallback. Each card must also land on the entry it names. The spec's
 * "Compare his experience" is pinned as unanswerable, which is why it is not offered.
 */
describe("Ask Tushky grounding (TKT-104 r2)", () => {
  const provider = new LocalKnowledgeProvider(knowledge);
  const matched = (query: string) => {
    const answer = provider.answerFor(query, { surface: "panel" });
    return answer.kind === "answer" ? answer.matched[0] : undefined;
  };

  it("shows Tushar's six questions, in order, one per category", () => {
    expect(TUSHKY_SUGGESTIONS.map((s) => s.label)).toEqual([
      "What products has Tushar built?",
      "What impact has he created?",
      "Show me his product thinking process.",
      "What is his AI / cloud experience?",
      "What are his strongest skills?",
      "Walk me through a specific project.",
    ]);
    expect(new Set(TUSHKY_SUGGESTIONS.map((s) => s.category)).size).toBe(6);
  });

  it("every suggestion resolves to its intended sourced entry", () => {
    for (const s of TUSHKY_SUGGESTIONS) expect(matched(s.query), `${s.label} → "${s.query}"`).toBe(s.entry);
  });

  it("the two remapped cards would have hit the product list as worded (why they are remapped)", () => {
    expect(matched("Show me his product thinking process.")).toBe("built");
    expect(matched("Walk me through a specific project.")).toBe("built");
  });

  it("every entry has a follow-up label, and every follow-up for every answer is answerable", () => {
    for (const entry of knowledge) {
      expect(FOLLOW_UP_LABELS[entry.id], entry.id).toBeTruthy();
      const chips = followUpsFor(entry.id);
      expect(chips.length, entry.id).toBeGreaterThanOrEqual(2);
      expect(chips.length, entry.id).toBeLessThanOrEqual(3);
      for (const chip of chips) {
        const hit = matched(chip.query);
        expect(hit, `${entry.id} → ${chip.label}`).toBeDefined();
        expect(hit, `${entry.id} → ${chip.label} must not repeat the answer`).not.toBe(entry.id);
      }
    }
  });

  it("follow-ups are derived from shared sources and skip what was already answered", () => {
    // `most-technical` (RailCite) shares the /work/railcite page with the RailCite-citing entries.
    const chips = followUpsFor("most-technical").map((c) => matched(c.query));
    const railcitePages = (id: string) =>
      knowledge.find((e) => e.id === id)!.evidence.some((e) => e.href.startsWith("/work/railcite"));
    for (const id of chips) expect(railcitePages(id!), id).toBe(true);
    const answered = new Set(chips.slice(0, 1) as string[]);
    expect(followUpsFor("most-technical", answered).map((c) => matched(c.query))).not.toContain(chips[0]);
  });

  it("the empty fallback's follow-ups are the index's own suggestions, all answerable", () => {
    const empty = provider.answerFor("what is the weather in paris", { surface: "panel" });
    expect(empty.kind).toBe("empty");
    if (empty.kind !== "empty") return;
    const chips = followUpsForPrompts(empty.suggestions);
    expect(chips.length).toBeGreaterThanOrEqual(2);
    for (const chip of chips) expect(matched(chip.query), chip.label).toBeDefined();
  });

  it("'Compare his experience' is unanswerable, so it is never offered", () => {
    expect(provider.answerFor("Compare his experience").kind).toBe("empty");
    const offered = [
      ...TUSHKY_SUGGESTIONS.map((s) => s.label),
      ...knowledge.flatMap((e) => followUpsFor(e.id).map((c) => c.label)),
    ];
    expect(offered.some((l) => /compare/i.test(l))).toBe(false);
  });
});
