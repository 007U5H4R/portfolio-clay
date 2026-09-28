import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import faqData from "@/data/tushky/faq.json";
import type { Answer, AnswerProvider } from "@/lib/ask";
import { FaqCacheProvider, type FaqEntry } from "@/lib/ask/faq";
import { AskProvider, SKELETON_FLOOR_MS, useAskChat } from "@/components/ai/AskProvider";

/**
 * TASK-123 (FAQ-cache spec §57): a cached answer lands at once — no skeleton floor, no fake typing — while
 * an index answer keeps the ≥ 150 ms floor. Each turn is asked with the conversation's earlier questions.
 */
const FAQ = faqData as FaqEntry[];
const INDEX_REPLY: Answer = { kind: "answer", text: "index answer", evidence: [{ label: "About", href: "/about" }], matched: ["pm"], score: 1 };

function setup() {
  const index = { name: "index", ask: vi.fn<AnswerProvider["ask"]>().mockResolvedValue(INDEX_REPLY) };
  const faq = new FaqCacheProvider(FAQ, index, { fresh: FAQ.map((e) => e.id) });
  const wrapper = ({ children }: { children: ReactNode }) => <AskProvider provider={index}>{children}</AskProvider>;
  const hook = renderHook(() => useAskChat(faq), { wrapper });
  return { index, hook };
}

const lastTurn = (messages: ReturnType<typeof useAskChat>["messages"]) => messages.at(-1)!;

describe("useAskChat with the FAQ cache", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("a cache hit renders without waiting for the skeleton floor", async () => {
    const { hook } = setup();
    await act(async () => {
      hook.result.current.ask("What products has Tushar built?");
      await vi.advanceTimersByTimeAsync(0); // microtasks only — no time passes
    });
    const turn = lastTurn(hook.result.current.messages);
    expect(turn.role === "tushky" && turn.status).toBe("answer");
    expect(turn.role === "tushky" && turn.answer?.kind === "answer" && turn.answer.sourceType).toBe("faq-cache");
  });

  it("a miss goes to the index and keeps the floor, with the conversation as history", async () => {
    const { hook, index } = setup();
    await act(async () => {
      hook.result.current.ask("Tell me about RailCite.");
      await vi.advanceTimersByTimeAsync(0);
    });
    await act(async () => {
      hook.result.current.ask("What was hardest about it?");
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(lastTurn(hook.result.current.messages)).toMatchObject({ role: "tushky", status: "loading" });
    expect(index.ask).toHaveBeenCalledWith("What was hardest about it?", { surface: "panel", history: ["Tell me about RailCite."] });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(SKELETON_FLOOR_MS);
    });
    expect(lastTurn(hook.result.current.messages)).toMatchObject({ role: "tushky", status: "answer" });
  });
});
