import { describe, expect, it } from "vitest";
import { DEFAULT_API_HOST, MIXPANEL_API_HOSTS, isNonProductionHost, resolveConfig, type BrowserContext, type RawEnv } from "@/lib/analytics/config";
import { consentAllows } from "@/lib/analytics/consent";

const TOKEN = "0123456789abcdef0123456789abcdef";
const LIVE: BrowserContext = { hostname: "tusharpathak.com", doNotTrack: null, globalPrivacyControl: false };
const on = (env: RawEnv = {}, browser: Partial<BrowserContext> = {}) => resolveConfig({ token: TOKEN, ...env }, { ...LIVE, ...browser });

describe("analytics config gate (TASK-194)", () => {
  it("is a complete no-op without a token", () => {
    expect(resolveConfig({}, LIVE)).toEqual({ enabled: false, reason: "no-token" });
    expect(resolveConfig({ token: "" }, LIVE)).toEqual({ enabled: false, reason: "no-token" });
    expect(resolveConfig({ token: "   " }, LIVE)).toEqual({ enabled: false, reason: "no-token" });
  });

  it("treats a malformed token as not configured", () => {
    expect(resolveConfig({ token: "has spaces and symbols!" }, LIVE)).toEqual({ enabled: false, reason: "invalid-token" });
    expect(resolveConfig({ token: "x" }, LIVE)).toEqual({ enabled: false, reason: "invalid-token" });
  });

  it("enables on the live host as production with the US host and opt-out consent by default", () => {
    expect(on()).toEqual({ enabled: true, token: TOKEN, environment: "production", apiHost: DEFAULT_API_HOST, consentMode: "opt-out" });
  });

  it.each(["localhost", "127.0.0.1", "[::1]", "app.localhost", "mac.local", "portfolio-clay-git-x-tushar.vercel.app", "LOCALHOST"])("stays silent on %s unless an environment is named", (hostname) => {
    expect(on({}, { hostname })).toEqual({ enabled: false, reason: "non-production-host" });
  });

  it("stays silent on a Vercel preview / development build even on a custom domain", () => {
    expect(on({ vercelEnv: "preview" })).toEqual({ enabled: false, reason: "non-production-host" });
    expect(on({ vercelEnv: "development" })).toEqual({ enabled: false, reason: "non-production-host" });
    expect(on({ vercelEnv: "production" }).enabled).toBe(true);
  });

  it("an explicit NEXT_PUBLIC_ANALYTICS_ENV allows localhost/previews and labels the data", () => {
    expect(on({ analyticsEnv: "development" }, { hostname: "localhost" })).toMatchObject({ enabled: true, environment: "development" });
    expect(on({ analyticsEnv: "STAGING", vercelEnv: "preview" }, { hostname: "x.vercel.app" })).toMatchObject({ enabled: true, environment: "staging" });
    expect(on({ analyticsEnv: "production" })).toMatchObject({ environment: "production" });
  });

  it("ignores an unrecognised NEXT_PUBLIC_ANALYTICS_ENV (it does not unlock localhost)", () => {
    expect(on({ analyticsEnv: "yes please" }, { hostname: "localhost" })).toEqual({ enabled: false, reason: "non-production-host" });
  });

  it("respects Do Not Track in every spelling and Global Privacy Control, even when an environment is forced", () => {
    expect(on({}, { doNotTrack: "1" })).toEqual({ enabled: false, reason: "do-not-track" });
    expect(on({}, { doNotTrack: "yes" })).toEqual({ enabled: false, reason: "do-not-track" });
    expect(on({}, { doNotTrack: "0" }).enabled).toBe(true);
    expect(on({}, { globalPrivacyControl: true })).toEqual({ enabled: false, reason: "global-privacy-control" });
    expect(on({ analyticsEnv: "development" }, { hostname: "localhost", doNotTrack: "1" })).toEqual({ enabled: false, reason: "do-not-track" });
  });

  it("accepts only the three Mixpanel ingestion hosts, and refuses (never falls back) on anything else", () => {
    for (const apiHost of MIXPANEL_API_HOSTS) expect(on({ apiHost })).toMatchObject({ enabled: true, apiHost });
    expect(on({ apiHost: "https://api-eu.mixpanel.com/" })).toMatchObject({ enabled: true, apiHost: "https://api-eu.mixpanel.com" });
    expect(on({ apiHost: "https://evil.example" })).toEqual({ enabled: false, reason: "invalid-api-host" });
    expect(on({ apiHost: "http://api-js.mixpanel.com" })).toEqual({ enabled: false, reason: "invalid-api-host" });
  });

  it("reads the consent mode", () => {
    expect(on({ consentMode: "opt-in" })).toMatchObject({ consentMode: "opt-in" });
    expect(on({ consentMode: "OPT-IN" })).toMatchObject({ consentMode: "opt-in" });
    expect(on({ consentMode: "whatever" })).toMatchObject({ consentMode: "opt-out" });
  });

  it("classifies hosts", () => {
    expect(isNonProductionHost("tusharpathak.com")).toBe(false);
    expect(isNonProductionHost("www.tusharpathak.com")).toBe(false);
    expect(isNonProductionHost("foo.vercel.app")).toBe(true);
  });
});

describe("consent decision (TASK-194)", () => {
  it("opt-out mode: collects unless the visitor denied", () => {
    expect(consentAllows("unknown", "opt-out")).toBe(true);
    expect(consentAllows("granted", "opt-out")).toBe(true);
    expect(consentAllows("denied", "opt-out")).toBe(false);
  });
  it("opt-in mode: nothing until granted", () => {
    expect(consentAllows("unknown", "opt-in")).toBe(false);
    expect(consentAllows("denied", "opt-in")).toBe(false);
    expect(consentAllows("granted", "opt-in")).toBe(true);
  });
});
