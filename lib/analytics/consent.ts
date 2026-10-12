/**
 * Consent for analytics (TASK-194). The site has no cookie banner and, until now, only cookie-less Vercel
 * Analytics. Policy, in order:
 *   1. Do Not Track / Global Privacy Control (config.ts) always block analytics, whatever is stored here.
 *   2. A stored opt-out ("denied") blocks it. A visitor can set it with `?analytics=off` (and undo it with
 *      `?analytics=on`), no UI needed; `setAnalyticsConsent()` is the hook a future banner calls.
 *   3. Otherwise the mode decides: `opt-out` (default: collection starts, the visitor can stop it) or
 *      `opt-in` (nothing is loaded or sent until "granted" is stored, the stricter setting for an EU
 *      audience once a banner exists). Set with NEXT_PUBLIC_ANALYTICS_CONSENT.
 * Storage is one localStorage key holding "granted" or "denied"; every access is guarded.
 */
import type { ConsentMode } from "./config";

export const CONSENT_KEY = "pt-analytics-consent";
export type ConsentState = "granted" | "denied" | "unknown";

function store(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function readConsent(): ConsentState {
  try {
    const v = store()?.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : "unknown";
  } catch {
    return "unknown";
  }
}

/** Persist a choice. Returns false when storage is blocked (the in-memory choice still applies for this page). */
export function writeConsent(state: "granted" | "denied"): boolean {
  try {
    store()?.setItem(CONSENT_KEY, state);
    return store() !== null;
  } catch {
    return false;
  }
}

/** Whether tracking may run for this consent state and mode. */
export function consentAllows(state: ConsentState, mode: ConsentMode): boolean {
  if (state === "denied") return false;
  return mode === "opt-out" ? true : state === "granted";
}

/** `?analytics=off|on` (the only query value this module reads). Returns the state it applied, if any. */
export function applyConsentParam(search: string): "granted" | "denied" | null {
  const value = new URLSearchParams(search).get("analytics");
  if (value !== "off" && value !== "on") return null;
  const state = value === "off" ? "denied" : "granted";
  writeConsent(state); // blocked storage: the choice still applies to this page load
  return state;
}
