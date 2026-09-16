/**
 * format.test.ts (technical-plan.md §B S08.03) — unit coverage for lib/format.ts. Runs in the
 * `node` Vitest project (pure logic, no DOM). Locks the exact rendered strings the data views rely
 * on, and the fail-loud behaviour on malformed input.
 */
import { describe, expect, it } from "vitest";
import {
  formatAsOf,
  formatNumber,
  formatRange,
  formatYearMonth,
  readingTime,
} from "@/lib/format";

describe("formatAsOf", () => {
  it("renders 'as of D Mon YYYY' with an un-padded day", () => {
    expect(formatAsOf("2026-08-24")).toBe("as of 24 Aug 2026");
    expect(formatAsOf("2026-01-04")).toBe("as of 4 Jan 2026");
    expect(formatAsOf("2022-12-31")).toBe("as of 31 Dec 2022");
  });

  it("throws on a malformed date rather than rendering garbage", () => {
    expect(() => formatAsOf("2026-8-4")).toThrow();
    expect(() => formatAsOf("Aug 2026")).toThrow();
    expect(() => formatAsOf("2026-13-01")).toThrow();
  });
});

describe("formatYearMonth", () => {
  it("renders 'Mon YYYY'", () => {
    expect(formatYearMonth("2026-08")).toBe("Aug 2026");
    expect(formatYearMonth("2022-01")).toBe("Jan 2022");
  });

  it("throws on a malformed year-month", () => {
    expect(() => formatYearMonth("2026-08-24")).toThrow();
    expect(() => formatYearMonth("2026")).toThrow();
  });
});

describe("formatRange", () => {
  it("renders an open-ended range as '… – present'", () => {
    expect(formatRange({ start: "2026-08" })).toBe("Aug 2026 – present");
    expect(formatRange({ start: "2026-08", end: null })).toBe("Aug 2026 – present");
  });

  it("renders a closed range with an en dash", () => {
    expect(formatRange({ start: "2022-01", end: "2026-08" })).toBe("Jan 2022 – Aug 2026");
  });
});

describe("formatNumber", () => {
  it("groups thousands and preserves fractions", () => {
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(42)).toBe("42");
    expect(formatNumber(1234)).toBe("1,234");
    expect(formatNumber(1234567)).toBe("1,234,567");
    expect(formatNumber(1234.5)).toBe("1,234.5");
    expect(formatNumber(-1234)).toBe("-1,234");
  });

  it("throws on non-finite input", () => {
    expect(() => formatNumber(NaN)).toThrow();
    expect(() => formatNumber(Infinity)).toThrow();
  });
});

describe("readingTime", () => {
  it("rounds up at 200 wpm with a floor of 1 minute", () => {
    expect(readingTime(400)).toBe("2 min read");
    expect(readingTime(201)).toBe("2 min read");
    expect(readingTime(200)).toBe("1 min read");
    expect(readingTime(1)).toBe("1 min read");
    expect(readingTime(0)).toBe("1 min read");
  });
});
