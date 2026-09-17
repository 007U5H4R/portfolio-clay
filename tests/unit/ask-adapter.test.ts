import { describe, expect, it } from "vitest";
import { AskError } from "@/lib/ask/adapter";
import { AnswerSchema } from "@/lib/ask/answer-schema";

/**
 * The RAG boundary (technical-plan.md §A4): a network provider's reply is parsed through
 * `AnswerSchema` so a backend can never hand the UI a shape it does not understand. Both `Answer`
 * kinds must parse; an `answer` without evidence must be rejected (the no-unsourced-claim invariant).
 */
describe("ask/adapter AnswerSchema", () => {
  it("accepts a well-formed answer", () => {
    const ok = AnswerSchema.safeParse({
      kind: "answer",
      text: "RailCite is a RAG pipeline.",
      evidence: [{ label: "RailCite", href: "/work/railcite" }],
      matched: ["most-technical"],
      score: 0.87,
    });
    expect(ok.success).toBe(true);
  });

  it("accepts a well-formed empty answer (no evidence required)", () => {
    const ok = AnswerSchema.safeParse({
      kind: "empty",
      text: "I only answer from the sourced facts on this site.",
      evidence: [],
      matched: [],
      suggestions: ["What products have you built?"],
    });
    expect(ok.success).toBe(true);
  });

  it("rejects an answer with no evidence", () => {
    const bad = AnswerSchema.safeParse({
      kind: "answer",
      text: "an unsourced claim",
      evidence: [],
      matched: ["x"],
      score: 1,
    });
    expect(bad.success).toBe(false);
  });

  it("rejects an unknown kind", () => {
    expect(AnswerSchema.safeParse({ kind: "guess", text: "x" }).success).toBe(false);
  });

  it("AskError carries a name and optional cause", () => {
    const cause = new Error("boom");
    const err = new AskError("RAG 500", cause);
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("AskError");
    expect(err.cause).toBe(cause);
  });
});
