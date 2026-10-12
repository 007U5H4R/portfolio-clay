import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/** track.ts reads NEXT_PUBLIC_MIXPANEL_TOKEN once at module load (Next inlines it at build), so each case re-imports it. */
async function load(token: string | undefined) {
  vi.resetModules();
  if (token === undefined) vi.unstubAllEnvs();
  else vi.stubEnv("NEXT_PUBLIC_MIXPANEL_TOKEN", token);
  return import("@/lib/analytics/track");
}

describe("track() facade (TASK-194)", () => {
  beforeEach(() => vi.unstubAllEnvs());
  afterEach(() => vi.unstubAllEnvs());

  it("is a no-op with no token: nothing queued, a late handler receives nothing", async () => {
    const m = await load(undefined);
    m.track("linkedin_profile_clicked", { cta_location: "hero" });
    const seen: unknown[] = [];
    m.attachHandler((n, p) => void seen.push([n, p]));
    expect(seen).toEqual([]);
    m.publishRoute("/");
    const routes: string[] = [];
    m.subscribeRoute((p) => void routes.push(p));
    expect(routes).toEqual([]);
  });

  it("with a token, queues calls made before the runtime attaches and flushes them in order", async () => {
    const m = await load("0123456789abcdef0123456789abcdef");
    m.track("linkedin_profile_clicked", { cta_location: "hero" });
    m.track("email_contact_clicked", { cta_location: "footer" });
    const seen: unknown[] = [];
    m.attachHandler((n, p) => void seen.push([n, p]));
    expect(seen).toEqual([["linkedin_profile_clicked", { cta_location: "hero" }], ["email_contact_clicked", { cta_location: "footer" }]]);
    m.track("resume_opened", { cta_location: "hero", open_method: "external_viewer" });
    expect(seen).toHaveLength(3);
  });

  it("caps the pre-load queue so a page can never grow it without bound", async () => {
    const m = await load("0123456789abcdef0123456789abcdef");
    for (let i = 0; i < 500; i++) m.track("linkedin_profile_clicked", { cta_location: "hero" });
    const seen: unknown[] = [];
    m.attachHandler((n, p) => void seen.push([n, p]));
    expect(seen.length).toBeLessThanOrEqual(40);
  });

  it("detach (analytics off for this visitor) drops the queue and everything after", async () => {
    const m = await load("0123456789abcdef0123456789abcdef");
    m.track("linkedin_profile_clicked", { cta_location: "hero" });
    m.detachHandler();
    const seen: unknown[] = [];
    m.track("linkedin_profile_clicked", { cta_location: "hero" });
    m.attachHandler((n, p) => void seen.push([n, p]));
    expect(seen).toEqual([]);
  });

  it("never throws into the caller, even if the handler does", async () => {
    const m = await load("0123456789abcdef0123456789abcdef");
    m.attachHandler(() => { throw new Error("boom"); });
    expect(() => m.track("linkedin_profile_clicked", { cta_location: "hero" })).not.toThrow();
  });

  it("publishes a route once and replays the current one to a late subscriber", async () => {
    const m = await load("0123456789abcdef0123456789abcdef");
    m.publishRoute("/projects");
    m.publishRoute("/projects");
    const seen: string[] = [];
    const off = m.subscribeRoute((p) => void seen.push(p));
    expect(seen).toEqual(["/projects"]);
    m.publishRoute("/work");
    m.publishRoute("/work");
    expect(seen).toEqual(["/projects", "/work"]);
    off();
    m.publishRoute("/about");
    expect(seen).toEqual(["/projects", "/work"]);
  });
});
