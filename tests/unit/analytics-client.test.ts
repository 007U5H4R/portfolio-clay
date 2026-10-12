import { beforeEach, describe, expect, it, vi } from "vitest";

const sdk = vi.hoisted(() => ({
  init: vi.fn(), track: vi.fn(), register: vi.fn(), register_once: vi.fn(), opt_out_tracking: vi.fn(), opt_in_tracking: vi.fn(),
}));
vi.mock("mixpanel-browser", () => ({ default: sdk }));

const CFG = { enabled: true as const, token: "0123456789abcdef0123456789abcdef", environment: "production" as const, apiHost: "https://api-eu.mixpanel.com", consentMode: "opt-out" as const };

describe("Mixpanel client (TASK-194)", () => {
  beforeEach(() => {
    vi.resetModules();
    Object.values(sdk).forEach((f) => f.mockReset());
    delete (globalThis as { __ptMixpanel?: unknown }).__ptMixpanel;
  });

  it("is configured for privacy: no IP, no cookies, no autocapture, no replay, no URL capture", async () => {
    const { sdkConfig, BLOCKED_SDK_PROPERTIES } = await import("@/lib/analytics/client");
    const c = sdkConfig(CFG);
    expect(c).toMatchObject({
      api_host: "https://api-eu.mixpanel.com",
      ip: false,
      persistence: "localStorage",
      cross_subdomain_cookie: false,
      cross_site_cookie: false,
      autocapture: false,
      track_pageview: false,
      record_sessions_percent: 0,
      flags: false,
      ignore_dnt: false,
      store_google: false,
      track_marketing: false,
      save_referrer: false,
      skip_first_touch_marketing: true,
      stop_utm_persistence: true,
      debug: false,
      batch_requests: true,
    });
    for (const p of ["$current_url", "$referrer"]) expect(c.property_blacklist).toContain(p);
    expect(BLOCKED_SDK_PROPERTIES.length).toBeGreaterThan(0);
  });

  it("initialises the SDK exactly once, even for concurrent or repeated starts", async () => {
    const { createMixpanelSink } = await import("@/lib/analytics/client");
    const [a, b] = await Promise.all([createMixpanelSink(CFG), createMixpanelSink(CFG)]);
    const c = await createMixpanelSink(CFG);
    expect(sdk.init).toHaveBeenCalledTimes(1);
    expect(sdk.init).toHaveBeenCalledWith(CFG.token, expect.objectContaining({ ip: false, api_host: CFG.apiHost }));
    expect(a).toBe(b);
    expect(a).toBe(c);
  });

  it("delegates track / register / opt-out, and opt-out wipes local data via the SDK", async () => {
    const { createMixpanelSink } = await import("@/lib/analytics/client");
    const sink = await createMixpanelSink(CFG);
    sink.track("resume_opened", { cta_location: "hero" });
    sink.register({ environment: "production" });
    sink.registerOnce({ initial_utm_source: "x" });
    sink.optOut();
    sink.optIn();
    expect(sdk.track).toHaveBeenCalledWith("resume_opened", { cta_location: "hero" });
    expect(sdk.register).toHaveBeenCalledWith({ environment: "production" });
    expect(sdk.register_once).toHaveBeenCalledWith({ initial_utm_source: "x" });
    expect(sdk.opt_out_tracking).toHaveBeenCalledTimes(1);
    expect(sdk.opt_in_tracking).toHaveBeenCalledTimes(1);
  });
});
