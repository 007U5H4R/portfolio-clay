import { afterEach, describe, expect, it, vi } from "vitest";
import { AskError } from "@/lib/ask/adapter";
import { RagProvider } from "@/lib/ask/rag-provider";

/**
 * RagProvider is a reserved stub (technical-plan.md §A4) — not wired in v1 (S09.06). These tests hold
 * the `AnswerProvider` boundary honest: it throws when unconfigured, parses a valid backend reply,
 * and rejects a malformed one (so a future backend can never hand the UI a shape it can't render).
 */
afterEach(() => vi.restoreAllMocks());

const validReply = {
  kind: "answer",
  text: "RailCite is a RAG pipeline.",
  evidence: [{ label: "RailCite", href: "/work/railcite" }],
  matched: ["most-technical"],
  score: 0.9,
};

describe("RagProvider", () => {
  it("throws AskError when RAG_ENDPOINT is not configured", async () => {
    const p = new RagProvider(undefined);
    await expect(p.ask("hi")).rejects.toBeInstanceOf(AskError);
  });

  it("parses a valid mocked backend response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify(validReply), { status: 200 })),
    );
    const p = new RagProvider("https://rag.example/ask");
    const a = await p.ask("most technical project");
    expect(a.kind).toBe("answer");
    if (a.kind === "answer") expect(a.matched).toEqual(["most-technical"]);
  });

  it("rejects a malformed backend response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ kind: "answer", text: "no evidence" }), { status: 200 })),
    );
    const p = new RagProvider("https://rag.example/ask");
    await expect(p.ask("q")).rejects.toBeInstanceOf(AskError);
  });

  it("throws AskError on a non-2xx status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("nope", { status: 502 })),
    );
    const p = new RagProvider("https://rag.example/ask");
    await expect(p.ask("q")).rejects.toThrow(/502/);
  });
});
