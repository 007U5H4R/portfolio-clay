/**
 * The analytics runtime (TASK-194). This module and everything it imports (the SDK, the catalogue, the
 * validators) live in a lazy chunk that the loader requests only after hydration, when the browser is
 * idle, and only if a token is configured. `start()` re-checks every gate (environment, Do Not Track,
 * Global Privacy Control, consent) before the SDK is even downloaded.
 */
import { installClickDelegation } from "./click-delegation";
import { createMixpanelSink, type MixpanelSink } from "./client";
import { readBrowserContext, readPublicEnv, resolveConfig } from "./config";
import { deviceTypeFor } from "./device";
import { applyConsentParam, consentAllows, readConsent, writeConsent } from "./consent";
import { SCHEMA_VERSION } from "./events";
import { startPage } from "./page-tracking";
import { isMeasuredPath } from "./pages";
import { canonicalPath, referrerHost, sanitizeUtm } from "./sanitize";
import { attachHandler, detachHandler, subscribeRoute } from "./track";
import { createTracker, type Tracker } from "./tracker";

const SEEN_KEY = "pt-analytics-seen";

interface Live {
  sink: MixpanelSink;
  tracker: Tracker;
  stops: Array<() => void>;
}

// Held on globalThis, not in module scope: if the bundler ever evaluates this module twice (hot reload,
// a duplicated chunk), listeners and state are still shared, so nothing can be installed twice.
declare global {
  var __ptAnalyticsStarted: boolean | undefined;
  var __ptAnalyticsLive: Live | null | undefined;
}

function readSessionType(): "new" | "returning" {
  try {
    const seen = window.localStorage.getItem(SEEN_KEY) === "1";
    window.localStorage.setItem(SEEN_KEY, "1");
    return seen ? "returning" : "new";
  } catch {
    return "new"; // storage blocked: every load looks new, which is the honest "unknown" default
  }
}

function navigationTypeAtLoad(): "direct" | "reload" | "back_forward" {
  const entry = performance.getEntriesByType?.("navigation")?.[0] as PerformanceNavigationTiming | undefined;
  return entry?.type === "reload" ? "reload" : entry?.type === "back_forward" ? "back_forward" : "direct";
}

function previousPathFromReferrer(): string | null {
  try {
    if (!document.referrer) return null;
    const ref = new URL(document.referrer);
    return ref.origin === location.origin ? canonicalPath(ref.pathname) : null;
  } catch {
    return null;
  }
}

export async function start(): Promise<void> {
  if (globalThis.__ptAnalyticsStarted) return;
  globalThis.__ptAnalyticsStarted = true;

  // The visitor's own switch is honoured even when analytics would otherwise be off.
  applyConsentParam(location.search);
  const cfg = resolveConfig(readPublicEnv(), readBrowserContext());
  if (!cfg.enabled || !consentAllows(readConsent(), cfg.consentMode)) {
    detachHandler();
    return;
  }

  let sink: MixpanelSink;
  try {
    sink = await createMixpanelSink(cfg);
  } catch {
    detachHandler(); // blocked, offline or an ad-blocker removed the chunk: the site carries on, silently
    return;
  }
  const tracker = createTracker({ sink, onInvalid: process.env.NODE_ENV === "production" ? "silent" : "warn" });
  const stops: Array<() => void> = [];
  const live: Live = { sink, tracker, stops };
  globalThis.__ptAnalyticsLive = live;

  // Super properties: sent with every event. Smallest useful set (docs/analytics.md).
  const utm = sanitizeUtm(location.search);
  const sessionType = readSessionType();
  sink.register({ environment: cfg.environment, schema_version: SCHEMA_VERSION, device_type: deviceTypeFor(window.innerWidth) });
  const campaign = Object.entries(utm);
  if (campaign.length > 0) {
    // Last touch: the most recent campaign tags replace the previous ones; first touch is kept separately.
    sink.register(Object.fromEntries(campaign));
    sink.registerOnce(Object.fromEntries(campaign.map(([k, v]) => [`initial_${k}`, v])));
  }
  const host = referrerHost(document.referrer, location.hostname);
  if (host) sink.registerOnce({ initial_referring_domain: host });

  // ---- routes -----------------------------------------------------------------------------------
  let first = true;
  let popped = false;
  let previousPath: string | null = previousPathFromReferrer();
  let stopPage: (() => void) | null = null;
  const onPop = () => {
    popped = true;
  };
  window.addEventListener("popstate", onPop);
  stops.push(() => window.removeEventListener("popstate", onPop));

  const unsubscribe = subscribeRoute((raw) => {
    const path = canonicalPath(raw);
    stopPage?.();
    stopPage = null;
    if (!isMeasuredPath(path)) return;
    sink.register({ device_type: deviceTypeFor(window.innerWidth) });
    const theme = document.documentElement.dataset.theme;
    stopPage = startPage(tracker, {
      path,
      navigationType: first ? navigationTypeAtLoad() : popped ? "back_forward" : "client_navigation",
      isLanding: first,
      sessionType,
      theme: theme === "light" || theme === "dark" ? theme : undefined,
      previousPath,
    });
    first = false;
    popped = false;
    previousPath = path;
  });
  stops.push(unsubscribe, () => stopPage?.());

  stops.push(installClickDelegation(tracker));
  attachHandler((name, props) => void tracker.track(name, props));
}

/** Tear everything down: listeners, observers, the track() handler. Idempotent. */
export function stop(): void {
  detachHandler();
  const current = globalThis.__ptAnalyticsLive;
  globalThis.__ptAnalyticsLive = null;
  current?.stops.forEach((fn) => fn());
  globalThis.__ptAnalyticsStarted = false;
}

/** Consent changed after start (a banner, or `setAnalyticsConsent`). Withdrawal wipes the SDK's local data. */
export async function applyConsent(state: "granted" | "denied"): Promise<void> {
  writeConsent(state);
  if (state === "denied") {
    const sink = globalThis.__ptAnalyticsLive?.sink ?? globalThis.__ptMixpanel;
    stop();
    sink?.optOut();
    return;
  }
  if (!globalThis.__ptAnalyticsLive) {
    globalThis.__ptMixpanel?.optIn(); // re-granting after a withdrawal in this same page life
    globalThis.__ptAnalyticsStarted = false;
    await start();
  }
}
