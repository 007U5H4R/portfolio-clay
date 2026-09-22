import { afterEach, describe, expect, it, vi } from "vitest";
import { checkExternal, isTimeoutError, resetCache } from "@/tests/e2e/crawler";

/**
 * CF-1 (M-007 carry-forward, EVAL-011 robustness): a timeout/AbortError firing on a slow-but-live
 * external host must classify as `warn` ("unconfirmed, not dead"), never `dead` — the same leniency
 * class as the existing BOT_BLOCK_STATUSES → WARN handling. A genuine connection/DNS failure must
 * still classify as `dead`. Regression for the crawler.ts `catch (err)` branch in `checkExternal`.
 */
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  resetCache();
});

describe("isTimeoutError (pure classifier)", () => {
  it("is true for a DOMException/Error named AbortError", () => {
    expect(isTimeoutError(new DOMException("aborted", "AbortError"))).toBe(true);
  });

  it("is true for a DOMException/Error named TimeoutError (AbortSignal.timeout)", () => {
    expect(isTimeoutError(new DOMException("timed out", "TimeoutError"))).toBe(true);
  });

  it("is false for a genuine connection/DNS error", () => {
    expect(isTimeoutError(new TypeError("fetch failed"))).toBe(false);
  });

  it("is false for a non-error value", () => {
    expect(isTimeoutError("nope")).toBe(false);
    expect(isTimeoutError(undefined)).toBe(false);
  });
});

describe("checkExternal — timeout vs. connection-error classification", () => {
  it("classifies a simulated AbortSignal.timeout firing as warn, not dead", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new DOMException("The operation was aborted due to timeout", "TimeoutError");
      }),
    );
    const outcome = await checkExternal("https://slow-but-live.example/page");
    expect(outcome.verdict).toBe("warn");
    expect(outcome.detail).toMatch(/timeout/i);
    expect(outcome.detail).toMatch(/not dead/i);
  });

  it("still classifies a genuine connection error as dead", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("fetch failed");
      }),
    );
    const outcome = await checkExternal("https://does-not-resolve.example/page");
    expect(outcome.verdict).toBe("dead");
    expect(outcome.detail).toMatch(/fetch error/i);
  });
});
