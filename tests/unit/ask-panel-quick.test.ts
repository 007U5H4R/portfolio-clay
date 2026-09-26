import { describe, expect, it } from "vitest";
import { knowledge } from "@/data/knowledge";
import { LocalKnowledgeProvider } from "@/lib/ask/local-provider";
import { QUICK_QUESTIONS } from "@/components/ai/AskPanel";

/**
 * TKT-104 (Design.md §11 Dev-49) — every AskPanel quick-action chip that submits a question must be
 * answerable from the retrieval index (never the empty fallback), so a chip never promises something
 * the panel cannot answer. "Compare experiences" (the reference's label) is pinned as unanswerable —
 * the reason it was relabelled; if the index ever learns it, revisit the chip.
 */
describe("AskPanel quick-action chips (TKT-104)", () => {
  const provider = new LocalKnowledgeProvider(knowledge);

  it("every question chip resolves to a sourced answer", () => {
    expect(QUICK_QUESTIONS.length).toBe(2);
    for (const { label, query } of QUICK_QUESTIONS) {
      const answer = provider.answerFor(query);
      expect(answer.kind, `${label} → "${query}"`).toBe("answer");
    }
  });

  it("maps each chip to the entry its label names", () => {
    const matched = (query: string) => {
      const a = provider.answerFor(query);
      return a.kind === "answer" ? a.matched : [];
    };
    expect(matched(QUICK_QUESTIONS.find((q) => q.label === "Summarize my skills")!.query)).toEqual(["skills"]);
    expect(matched(QUICK_QUESTIONS.find((q) => q.label === "Show my impact")!.query)).toEqual(["impact"]);
  });

  it("'Compare experiences' is still unanswerable (why the chip was relabelled)", () => {
    expect(provider.answerFor("Compare experiences").kind).toBe("empty");
  });
});
