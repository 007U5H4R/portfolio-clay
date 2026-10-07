// @vitest-environment jsdom
/** TASK-143.2 — the return-route helpers (gummy-bear.md §10): same-origin, never the lab itself. */
import { afterEach, describe, expect, it } from "vitest";
import { canGoBackToPortfolio, enteredFromPortfolio, readReturnRoute, rememberEntry, safeReturnRoute } from "@/lib/lab/session";

describe("safeReturnRoute", () => {
  it("keeps an in-app path", () => {
    expect(safeReturnRoute("/about")).toBe("/about");
    expect(safeReturnRoute("/work/foo?x=1")).toBe("/work/foo?x=1");
  });
  it("falls back to / for anything else", () => {
    for (const bad of [null, undefined, "", "about", "//evil.example", "https://evil.example", "/\\evil", "/lab", "/lab/", "/lab?x=1", "/\t/evil.example", "/\n/evil.example", "/\r/evil.example", "/\t\t/evil.example"]) {
      expect(safeReturnRoute(bad)).toBe("/");
    }
  });
});

describe("rememberEntry / readReturnRoute", () => {
  afterEach(() => window.sessionStorage.clear());
  it("round-trips the origin path and flags the entry", () => {
    expect(enteredFromPortfolio()).toBe(false);
    expect(readReturnRoute()).toBe("/");
    rememberEntry("/projects");
    expect(readReturnRoute()).toBe("/projects");
    expect(enteredFromPortfolio()).toBe(true);
  });
  it("never stores the lab as the return route", () => {
    rememberEntry("/lab");
    expect(readReturnRoute()).toBe("/");
  });
});

describe("canGoBackToPortfolio", () => {
  const referrer = (value: string) => Object.defineProperty(document, "referrer", { value, configurable: true });
  afterEach(() => {
    referrer("");
    window.sessionStorage.clear();
  });
  it("is true only after a trigger entry whose referrer is a portfolio page", () => {
    rememberEntry("/about");
    window.history.pushState({}, "", "/lab");
    referrer(`${window.location.origin}/about`);
    expect(canGoBackToPortfolio()).toBe(true);
  });
  it("is false for a direct visit (no trigger entry) or no/foreign/lab referrer", () => {
    window.history.pushState({}, "", "/lab");
    referrer(`${window.location.origin}/about`);
    expect(canGoBackToPortfolio()).toBe(false); // never entered via the trigger in this tab
    rememberEntry("/");
    referrer("");
    expect(canGoBackToPortfolio()).toBe(false);
    referrer("https://elsewhere.example/page");
    expect(canGoBackToPortfolio()).toBe(false);
    referrer(`${window.location.origin}/lab`);
    expect(canGoBackToPortfolio()).toBe(false);
  });
});
