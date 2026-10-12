import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * TASK-194 — the lazy runtime end to end in jsdom, with the Mixpanel client mocked: the gates (token,
 * host, Do Not Track, GPC, consent) decide whether the SDK is even loaded; routes produce exactly one
 * page_viewed; the delegated click listener emits conversions without ever blocking the click.
 */
const TOKEN = "0123456789abcdef0123456789abcdef";
const sink = { track: vi.fn(), register: vi.fn(), registerOnce: vi.fn(), optOut: vi.fn(), optIn: vi.fn() };
const createMixpanelSink = vi.fn(async (_cfg?: unknown) => sink);
vi.mock("@/lib/analytics/client", () => ({ createMixpanelSink: (cfg: unknown) => createMixpanelSink(cfg), BLOCKED_SDK_PROPERTIES: [], sdkConfig: () => ({}) }));
vi.mock("@/lib/analytics/page-tracking", async () => {
  const actual = await vi.importActual<typeof import("@/lib/analytics/page-tracking")>("@/lib/analytics/page-tracking");
  return { ...actual, startPage: vi.fn(actual.startPage) };
});

/** Remove whatever a previous runtime installed on the document (it lives on globalThis by design). */
function teardown() {
  const g = globalThis as { __ptAnalyticsLive?: { stops: Array<() => void> } | null; __ptAnalyticsStarted?: boolean; __ptMixpanel?: unknown };
  g.__ptAnalyticsLive?.stops.forEach((stop) => stop());
  g.__ptAnalyticsLive = null;
  g.__ptAnalyticsStarted = false;
  delete g.__ptMixpanel;
}

type Track = typeof import("@/lib/analytics/track");
type Runtime = typeof import("@/lib/analytics/runtime");

async function boot(opts: { env?: Record<string, string>; host?: string; dnt?: string | null; gpc?: boolean; search?: string; stored?: Record<string, string> } = {}) {
  vi.resetModules();
  vi.unstubAllEnvs();
  teardown();
  vi.stubEnv("NEXT_PUBLIC_MIXPANEL_TOKEN", TOKEN);
  vi.stubEnv("NEXT_PUBLIC_ANALYTICS_ENV", "");
  for (const [k, v] of Object.entries(opts.env ?? {})) vi.stubEnv(k, v);
  delete (globalThis as { __ptAnalyticsStarted?: boolean }).__ptAnalyticsStarted;
  window.localStorage.clear();
  for (const [k, v] of Object.entries(opts.stored ?? {})) window.localStorage.setItem(k, v);
  Object.defineProperty(window, "location", { configurable: true, value: new URL(`https://${opts.host ?? "tusharpathak.com"}/${opts.search ?? ""}`) });
  Object.defineProperty(navigator, "doNotTrack", { configurable: true, value: opts.dnt ?? null });
  Object.defineProperty(navigator, "globalPrivacyControl", { configurable: true, value: opts.gpc ?? false });
  const track: Track = await import("@/lib/analytics/track");
  const runtime: Runtime = await import("@/lib/analytics/runtime");
  return { track, runtime };
}

const sent = () => sink.track.mock.calls.map(([n, p]) => [n, p] as const);
const sentNames = () => sink.track.mock.calls.map(([n]) => n as string);

describe("analytics runtime (TASK-194)", () => {
  beforeEach(() => {
    Object.values(sink).forEach((f) => f.mockClear());
    createMixpanelSink.mockClear();
    document.body.innerHTML = "<main></main>";
  });
  afterEach(() => {
    teardown();
    vi.unstubAllEnvs();
  });

  describe("gates: the SDK is not even requested", () => {
    it.each([
      ["no token", { env: { NEXT_PUBLIC_MIXPANEL_TOKEN: "" } }],
      ["localhost without an environment", { host: "localhost" }],
      ["a Vercel preview host", { host: "portfolio-git-x.vercel.app" }],
      ["Do Not Track", { dnt: "1" }],
      ["Global Privacy Control", { gpc: true }],
      ["a stored opt-out", { stored: { "pt-analytics-consent": "denied" } }],
      ["opt-in mode without a grant", { env: { NEXT_PUBLIC_ANALYTICS_CONSENT: "opt-in" } }],
      ["a bad API host", { env: { NEXT_PUBLIC_MIXPANEL_API_HOST: "https://evil.example" } }],
    ])("%s", async (_label, opts) => {
      const { track, runtime } = await boot(opts);
      track.track("linkedin_profile_clicked", { cta_location: "hero" });
      await runtime.start();
      expect(createMixpanelSink).not.toHaveBeenCalled();
      expect(sink.track).not.toHaveBeenCalled();
      track.publishRoute("/");
      expect(sink.track).not.toHaveBeenCalled();
    });

    it("?analytics=off stores the opt-out and blocks this very page load", async () => {
      const { runtime } = await boot({ search: "?analytics=off" });
      await runtime.start();
      expect(window.localStorage.getItem("pt-analytics-consent")).toBe("denied");
      expect(createMixpanelSink).not.toHaveBeenCalled();
    });

    it("opt-in mode runs once a grant is stored; ?analytics=on grants", async () => {
      const a = await boot({ env: { NEXT_PUBLIC_ANALYTICS_CONSENT: "opt-in" }, stored: { "pt-analytics-consent": "granted" } });
      await a.runtime.start();
      expect(createMixpanelSink).toHaveBeenCalledTimes(1);
      const b = await boot({ env: { NEXT_PUBLIC_ANALYTICS_CONSENT: "opt-in" }, search: "?analytics=on" });
      await b.runtime.start();
      expect(createMixpanelSink).toHaveBeenCalledTimes(2);
    });
  });

  describe("when allowed", () => {
    it("starts once, registers privacy-safe super properties, and sends one page_viewed per route", async () => {
      const { track, runtime } = await boot({ search: "?utm_source=LinkedIn&utm_medium=social&token=SECRET&utm_campaign=launch#frag" });
      track.publishRoute("/projects");
      await runtime.start();
      await runtime.start(); // a second start (hot reload) is a no-op
      expect(createMixpanelSink).toHaveBeenCalledTimes(1);
      expect(createMixpanelSink).toHaveBeenCalledWith(expect.objectContaining({ token: TOKEN, environment: "production", apiHost: "https://api-js.mixpanel.com" }));

      expect(sentNames().filter((n) => n === "page_viewed")).toHaveLength(1);
      expect(sent()[0]).toEqual(["page_viewed", expect.objectContaining({ page_name: "portfolio", page_path: "/projects", is_landing: true, navigation_type: "direct", session_type: "new" })]);

      const registered = Object.assign({}, ...sink.register.mock.calls.map(([p]) => p));
      expect(registered).toMatchObject({ environment: "production", schema_version: 1, utm_source: "linkedin", utm_medium: "social", utm_campaign: "launch" });
      expect(JSON.stringify(sink.register.mock.calls) + JSON.stringify(sink.registerOnce.mock.calls)).not.toMatch(/SECRET|token|frag/);
      expect(sink.registerOnce).toHaveBeenCalledWith({ initial_utm_source: "linkedin", initial_utm_medium: "social", initial_utm_campaign: "launch" });
    });

    it("a client-side navigation is exactly one more page_viewed; republishing the same route is not", async () => {
      const { track, runtime } = await boot();
      track.publishRoute("/");
      await runtime.start();
      track.publishRoute("/");
      track.publishRoute("/work/teachspark");
      track.publishRoute("/work/teachspark");
      const views = sent().filter(([n]) => n === "page_viewed");
      expect(views).toHaveLength(2);
      expect(views[1]![1]).toMatchObject({ page_name: "case_study", page_path: "/work/teachspark", navigation_type: "client_navigation", is_landing: false });
      expect(sent().filter(([n]) => n === "case_study_viewed")).toEqual([["case_study_viewed", { project_id: "teachspark", entry_point: "home_page" }]]);
    });

    it("a browser Back is reported as back_forward", async () => {
      const { track, runtime } = await boot();
      track.publishRoute("/");
      await runtime.start();
      track.publishRoute("/work");
      window.dispatchEvent(new PopStateEvent("popstate"));
      track.publishRoute("/");
      expect(sent().filter(([n]) => n === "page_viewed").map(([, p]) => p.navigation_type)).toEqual(["direct", "client_navigation", "back_forward"]);
    });

    it("never measures the dev QA boards", async () => {
      const { track, runtime } = await boot();
      track.publishRoute("/dev/ask");
      await runtime.start();
      expect(sentNames()).toEqual([]);
    });

    it("flushes events components fired before the runtime was ready", async () => {
      const { track, runtime } = await boot();
      track.track("chatbot_opened", { entry_point: "header_button" });
      await runtime.start();
      expect(sent()).toContainEqual(["chatbot_opened", { entry_point: "header_button" }]);
    });

    it("the 2nd visit is returning; blocked storage reads as new", async () => {
      const first = await boot();
      first.track.publishRoute("/");
      await first.runtime.start();
      expect(sent()[0]![1]).toMatchObject({ session_type: "new" });
      sink.track.mockClear();
      teardown();
      vi.resetModules();
      const t2: Track = await import("@/lib/analytics/track");
      const r2: Runtime = await import("@/lib/analytics/runtime");
      t2.publishRoute("/");
      await r2.start();
      expect(sent()[0]![1]).toMatchObject({ session_type: "returning" });
    });

    it("a click on the résumé link emits the conversion once and never prevents the navigation", async () => {
      const { track, runtime } = await boot();
      track.publishRoute("/");
      await runtime.start();
      sink.track.mockClear();
      document.body.innerHTML = `<main><footer><a id="r" href="https://drive.google.com/file/d/1hqDF4-YlcdaoIRLBzKwI4D8pUWQ7ELJ_/view?usp=sharing" target="_blank">Resume</a></footer></main>`;
      const event = new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 });
      document.getElementById("r")!.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(false);
      expect(sentNames()).toEqual(["outbound_link_clicked", "resume_opened", "professional_cta_clicked"]);
      expect(JSON.stringify(sent())).not.toContain("1hqDF4");
    });

    it("the theme switch is tracked as a user change; hydration and system flips are not", async () => {
      const { track, runtime } = await boot();
      document.documentElement.dataset.theme = "light";
      track.publishRoute("/");
      await runtime.start();
      sink.track.mockClear();
      document.documentElement.dataset.theme = "dark"; // a system / hydration change: no click, no event
      expect(sink.track).not.toHaveBeenCalled();
      document.body.innerHTML = `<button data-theme-toggle id="t"></button>`;
      document.getElementById("t")!.dispatchEvent(new MouseEvent("click", { bubbles: true, button: 0 }));
      expect(sent()).toEqual([["theme_changed", { theme_from: "dark", theme_to: "light" }]]);
    });

    it("withdrawing consent stops tracking, wipes the SDK's local data, and a later grant resumes", async () => {
      const { track, runtime } = await boot();
      track.publishRoute("/");
      await runtime.start();
      await runtime.applyConsent("denied");
      expect(sink.optOut).toHaveBeenCalledTimes(1);
      expect(window.localStorage.getItem("pt-analytics-consent")).toBe("denied");
      sink.track.mockClear();
      track.track("linkedin_profile_clicked", { cta_location: "hero" });
      document.body.innerHTML = `<a id="m" href="mailto:a@b.co">x</a>`;
      document.getElementById("m")!.dispatchEvent(new MouseEvent("click", { bubbles: true, button: 0 }));
      expect(sink.track).not.toHaveBeenCalled();

      // A later grant (e.g. from a banner) resumes: the SDK is opted back in and clicks are measured again.
      createMixpanelSink.mockImplementation(async () => { (globalThis as { __ptMixpanel?: unknown }).__ptMixpanel = sink; return sink; });
      (globalThis as { __ptMixpanel?: unknown }).__ptMixpanel = sink;
      await runtime.applyConsent("granted");
      expect(sink.optIn).toHaveBeenCalledTimes(1);
      expect(window.localStorage.getItem("pt-analytics-consent")).toBe("granted");
      sink.track.mockClear();
      document.getElementById("m")!.dispatchEvent(new MouseEvent("click", { bubbles: true, button: 0 }));
      expect(sentNames()).toEqual(["email_contact_clicked", "professional_cta_clicked"]);
    });

    it("an SDK that cannot load leaves the site working", async () => {
      const { track, runtime } = await boot();
      createMixpanelSink.mockRejectedValueOnce(new Error("blocked by an extension"));
      track.track("linkedin_profile_clicked", { cta_location: "hero" });
      await expect(runtime.start()).resolves.toBeUndefined();
      expect(() => track.track("linkedin_profile_clicked", { cta_location: "hero" })).not.toThrow();
    });
  });
});
