/**
 * Analytics configuration (TASK-194): one pure function decides whether analytics may run at all, from
 * the build-time public env and the browser context. No token → a complete no-op (nothing is loaded,
 * no request is made). Localhost, `*.vercel.app` previews and Vercel preview/development builds are
 * silent unless `NEXT_PUBLIC_ANALYTICS_ENV` explicitly names an environment (then it labels the data).
 * Do Not Track and Global Privacy Control always win.
 */
export type AnalyticsEnvironment = "development" | "staging" | "production";
export type ConsentMode = "opt-out" | "opt-in";

/** The three Mixpanel ingestion hosts (US default, EU and India data residency). Nothing else is accepted. */
export const MIXPANEL_API_HOSTS = ["https://api-js.mixpanel.com", "https://api-eu.mixpanel.com", "https://api-in.mixpanel.com"] as const;
export const DEFAULT_API_HOST = MIXPANEL_API_HOSTS[0];

export interface RawEnv {
  token?: string | undefined;
  analyticsEnv?: string | undefined;
  apiHost?: string | undefined;
  consentMode?: string | undefined;
  vercelEnv?: string | undefined;
}

export interface BrowserContext {
  hostname: string;
  doNotTrack?: string | null | undefined;
  globalPrivacyControl?: boolean | undefined;
}

export type DisabledReason =
  | "no-token"
  | "invalid-token"
  | "invalid-api-host"
  | "non-production-host"
  | "do-not-track"
  | "global-privacy-control";

export type AnalyticsConfig =
  | { enabled: false; reason: DisabledReason }
  | { enabled: true; token: string; environment: AnalyticsEnvironment; apiHost: string; consentMode: ConsentMode };

/** A Mixpanel project token is a 32-character hex string. Anything else is treated as "not configured". */
const TOKEN = /^[A-Za-z0-9_-]{8,64}$/;
const ENVIRONMENTS: readonly string[] = ["development", "staging", "production"];

function isLocalHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return h === "localhost" || h === "127.0.0.1" || h === "[::1]" || h === "::1" || h.endsWith(".localhost") || h.endsWith(".local");
}

/** Hosts that are never the live site: localhost, Vercel preview deployments. */
export function isNonProductionHost(hostname: string, vercelEnv?: string): boolean {
  const h = hostname.toLowerCase();
  return isLocalHost(h) || h.endsWith(".vercel.app") || vercelEnv === "preview" || vercelEnv === "development";
}

export function resolveConfig(env: RawEnv, browser: BrowserContext): AnalyticsConfig {
  const token = env.token?.trim();
  if (!token) return { enabled: false, reason: "no-token" };
  if (!TOKEN.test(token)) return { enabled: false, reason: "invalid-token" };

  const apiHost = env.apiHost?.trim() ? env.apiHost.trim().replace(/\/+$/, "") : DEFAULT_API_HOST;
  // A wrong host must never silently route EU visitors' data to the US (or vice versa): refuse.
  if (!(MIXPANEL_API_HOSTS as readonly string[]).includes(apiHost)) return { enabled: false, reason: "invalid-api-host" };

  const explicit = env.analyticsEnv?.trim().toLowerCase();
  const explicitEnv = explicit && ENVIRONMENTS.includes(explicit) ? (explicit as AnalyticsEnvironment) : undefined;
  if (!explicitEnv && isNonProductionHost(browser.hostname, env.vercelEnv)) return { enabled: false, reason: "non-production-host" };

  if (browser.doNotTrack === "1" || browser.doNotTrack === "yes") return { enabled: false, reason: "do-not-track" };
  if (browser.globalPrivacyControl === true) return { enabled: false, reason: "global-privacy-control" };

  return {
    enabled: true,
    token,
    environment: explicitEnv ?? "production",
    apiHost,
    consentMode: env.consentMode?.trim().toLowerCase() === "opt-in" ? "opt-in" : "opt-out",
  };
}

/** The build-time env, read with literal `process.env.NEXT_PUBLIC_*` accesses so Next inlines them. */
export function readPublicEnv(): RawEnv {
  return {
    token: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN,
    analyticsEnv: process.env.NEXT_PUBLIC_ANALYTICS_ENV,
    apiHost: process.env.NEXT_PUBLIC_MIXPANEL_API_HOST,
    consentMode: process.env.NEXT_PUBLIC_ANALYTICS_CONSENT,
    vercelEnv: process.env.NEXT_PUBLIC_VERCEL_ENV,
  };
}

/** The browser half of the context: hostname, Do Not Track (all spellings) and Global Privacy Control. */
export function readBrowserContext(): BrowserContext {
  const nav = typeof navigator === "undefined" ? undefined : (navigator as Navigator & { globalPrivacyControl?: boolean; msDoNotTrack?: string });
  const win = typeof window === "undefined" ? undefined : (window as Window & { doNotTrack?: string });
  return {
    hostname: typeof location === "undefined" ? "" : location.hostname,
    doNotTrack: nav?.doNotTrack ?? win?.doNotTrack ?? nav?.msDoNotTrack ?? null,
    globalPrivacyControl: nav?.globalPrivacyControl === true,
  };
}
