import { beforeEach, describe, expect, it, vi } from "vitest";
import { CONSENT_KEY, applyConsentParam, readConsent, writeConsent } from "@/lib/analytics/consent";
import { readBrowserContext } from "@/lib/analytics/config";

describe("consent storage (TASK-194)", () => {
  beforeEach(() => window.localStorage.clear());

  it("defaults to unknown and round-trips granted / denied", () => {
    expect(readConsent()).toBe("unknown");
    writeConsent("denied");
    expect(readConsent()).toBe("denied");
    writeConsent("granted");
    expect(readConsent()).toBe("granted");
  });

  it("ignores any stored value that is not exactly granted / denied", () => {
    window.localStorage.setItem(CONSENT_KEY, "yes");
    expect(readConsent()).toBe("unknown");
  });

  it("?analytics=off opts out, ?analytics=on opts in, anything else changes nothing", () => {
    expect(applyConsentParam("?analytics=off")).toBe("denied");
    expect(readConsent()).toBe("denied");
    expect(applyConsentParam("?analytics=on&x=1")).toBe("granted");
    expect(readConsent()).toBe("granted");
    expect(applyConsentParam("?analytics=maybe")).toBeNull();
    expect(applyConsentParam("")).toBeNull();
    expect(readConsent()).toBe("granted");
  });

  it("blocked storage never throws and reads as unknown", () => {
    const spy = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("denied"); });
    const set = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("denied"); });
    expect(readConsent()).toBe("unknown");
    expect(writeConsent("denied")).toBe(false);
    expect(applyConsentParam("?analytics=off")).toBe("denied"); // still applies to this page load
    spy.mockRestore();
    set.mockRestore();
  });
});

describe("browser privacy signals (TASK-194)", () => {
  it("reads Do Not Track and Global Privacy Control from the browser", () => {
    Object.defineProperty(navigator, "doNotTrack", { configurable: true, value: "1" });
    Object.defineProperty(navigator, "globalPrivacyControl", { configurable: true, value: true });
    expect(readBrowserContext()).toMatchObject({ doNotTrack: "1", globalPrivacyControl: true });
    Object.defineProperty(navigator, "doNotTrack", { configurable: true, value: null });
    Object.defineProperty(navigator, "globalPrivacyControl", { configurable: true, value: undefined });
    expect(readBrowserContext()).toMatchObject({ doNotTrack: null, globalPrivacyControl: false });
  });
});
