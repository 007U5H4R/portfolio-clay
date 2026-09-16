import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import type { Answer, AnswerProvider } from "@/lib/ask";
import { AskProvider, useAsk, SKELETON_FLOOR_MS } from "@/components/ai/AskProvider";

/**
 * useAsk state machine (technical-plan.md §A4 / §B S10.01): idle → loading → answer | empty | error,
 * with the ≥150 ms skeleton floor, retry() re-submitting the last query, and reset() → idle. The
 * provider is injected as a mock through AskProvider (production uses createDefaultProvider()).
 */
const ANSWER_REPLY: Answer = {
  kind: "answer",
  text: "A verbatim answer string drawn from the knowledge base for this test.",
  evidence: [
    { label: "Work", href: "/work" },
    { label: "About", href: "/about" },
  ],
  matched: ["built"],
  score: 1,
};

const EMPTY_REPLY: Answer = {
  kind: "empty",
  text: "I only answer from the sourced facts on this site — try one of the prompts, or email me.",
  evidence: [],
  matched: [],
  suggestions: ["What impact have you created?", "How do you approach product discovery?", "What AI products have you worked on?"],
};

function makeProvider(ask: AnswerProvider["ask"]): AnswerProvider {
  return { name: "mock", ask };
}

function wrapperFor(provider: AnswerProvider) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <AskProvider provider={provider}>{children}</AskProvider>;
  };
}

describe("useAsk", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts idle, goes to loading on submit, then answer after the skeleton floor", async () => {
    const provider = makeProvider(vi.fn().mockResolvedValue(ANSWER_REPLY));
    const { result } = renderHook(() => useAsk("home"), { wrapper: wrapperFor(provider) });

    expect(result.current.status).toBe("idle");

    act(() => result.current.submit("what have you built"));
    expect(result.current.status).toBe("loading");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(SKELETON_FLOOR_MS);
    });
    expect(result.current.status).toBe("answer");
    expect(result.current.answer).toEqual(ANSWER_REPLY);
  });

  it("holds the loading state for the full skeleton floor even with an instant provider", async () => {
    const provider = makeProvider(vi.fn().mockResolvedValue(ANSWER_REPLY));
    const { result } = renderHook(() => useAsk("home"), { wrapper: wrapperFor(provider) });

    act(() => result.current.submit("q"));
    expect(result.current.status).toBe("loading");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(SKELETON_FLOOR_MS - 1);
    });
    expect(result.current.status).toBe("loading");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(result.current.status).toBe("answer");
  });

  it("maps an empty provider reply to the empty state", async () => {
    const provider = makeProvider(vi.fn().mockResolvedValue(EMPTY_REPLY));
    const { result } = renderHook(() => useAsk("home"), { wrapper: wrapperFor(provider) });

    act(() => result.current.submit("weather in paris"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(SKELETON_FLOOR_MS);
    });
    expect(result.current.status).toBe("empty");
    expect(result.current.answer).toEqual(EMPTY_REPLY);
  });

  it("goes to error when the provider throws, and retry() re-submits the last query", async () => {
    const ask = vi
      .fn()
      .mockRejectedValueOnce(new Error("boom"))
      .mockResolvedValueOnce(ANSWER_REPLY);
    const provider = makeProvider(ask);
    const { result } = renderHook(() => useAsk("home"), { wrapper: wrapperFor(provider) });

    act(() => result.current.submit("technical project"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(SKELETON_FLOOR_MS);
    });
    expect(result.current.status).toBe("error");

    act(() => result.current.retry());
    expect(result.current.status).toBe("loading");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(SKELETON_FLOOR_MS);
    });
    expect(result.current.status).toBe("answer");
    expect(ask).toHaveBeenCalledTimes(2);
    expect(ask).toHaveBeenLastCalledWith("technical project", { surface: "home" });
  });

  it("reset() returns to idle and clears the answer", async () => {
    const provider = makeProvider(vi.fn().mockResolvedValue(ANSWER_REPLY));
    const { result } = renderHook(() => useAsk("home"), { wrapper: wrapperFor(provider) });

    act(() => result.current.submit("q"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(SKELETON_FLOOR_MS);
    });
    expect(result.current.status).toBe("answer");

    act(() => result.current.reset());
    expect(result.current.status).toBe("idle");
    expect(result.current.answer).toBeNull();
    expect(result.current.query).toBe("");
  });

  it("ignores an empty/whitespace query", () => {
    const ask = vi.fn().mockResolvedValue(ANSWER_REPLY);
    const provider = makeProvider(ask);
    const { result } = renderHook(() => useAsk("home"), { wrapper: wrapperFor(provider) });

    act(() => result.current.submit("   "));
    expect(result.current.status).toBe("idle");
    expect(ask).not.toHaveBeenCalled();
  });
});
