import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { EVENT_NAMES } from "@/lib/analytics/events";

/** TASK-194 — docs/analytics.md must describe exactly the events the code can send, and the setup it promises. */
const doc = readFileSync(resolve(__dirname, "../../docs/analytics.md"), "utf8");

describe("docs/analytics.md (TASK-194)", () => {
  it("has a dictionary heading for every catalogue event and none for an event that does not exist", () => {
    const documented = [...doc.matchAll(/^#### `([a-z_]+)`/gm)].map((m) => m[1]);
    expect([...documented].sort()).toEqual([...EVENT_NAMES].sort());
  });

  it("states the right event count", () => {
    expect(doc).toContain(`${EVENT_NAMES.length} events`);
  });

  it("names every environment variable the code reads, and no token value", () => {
    for (const v of ["NEXT_PUBLIC_MIXPANEL_TOKEN", "NEXT_PUBLIC_ANALYTICS_ENV", "NEXT_PUBLIC_MIXPANEL_API_HOST", "NEXT_PUBLIC_ANALYTICS_CONSENT"]) expect(doc).toContain(v);
    expect(doc).not.toMatch(/\b[0-9a-f]{32}\b/);
  });

  it("documents the five funnels and the four dashboards", () => {
    for (const heading of ["Dashboard A", "Dashboard B", "Dashboard C", "Dashboard D"]) expect(doc).toContain(heading);
    for (const n of [1, 2, 3, 4, 5]) expect(doc).toMatch(new RegExp(`\\| ${n}\\. `));
  });

  it(".env.example lists the same variables", () => {
    const env = readFileSync(resolve(__dirname, "../../.env.example"), "utf8");
    for (const v of ["NEXT_PUBLIC_MIXPANEL_TOKEN=", "NEXT_PUBLIC_ANALYTICS_ENV=", "NEXT_PUBLIC_MIXPANEL_API_HOST=", "NEXT_PUBLIC_ANALYTICS_CONSENT="]) expect(env).toContain(v);
  });
});
