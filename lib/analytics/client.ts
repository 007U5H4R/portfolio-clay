/**
 * The Mixpanel client (TASK-194): the only module that imports the SDK, and only ever through a dynamic
 * `import()`, so `mixpanel-browser` is a separate lazy chunk that is not in any route's first-load JS and
 * is not fetched at all unless every gate in config.ts / consent.ts passes.
 *
 * Privacy configuration (each line is deliberate; docs/analytics.md "Privacy"):
 *   ip: false                  Mixpanel does not geolocate the visitor from the request IP.
 *   persistence: localStorage  no cookies at all (so no cross-subdomain or cross-site cookie either).
 *   autocapture / replay off   no DOM text, clicks or sessions are captured by the SDK; we send named events only.
 *   track_pageview: false      we send our own `page_viewed` (canonical path, once per route change).
 *   store_google / track_marketing / save_referrer off + property_blacklist
 *                              the SDK's own URL, referrer and campaign capture would send the FULL URL
 *                              (query + fragment) and the full referrer; we send sanitised equivalents.
 *   ignore_dnt: false          the SDK itself also respects Do Not Track.
 *   flags: false               no feature-flag network calls.
 */
import type { AnalyticsConfig } from "./config";
import type { Sink, SinkProps } from "./tracker";

type EnabledConfig = Extract<AnalyticsConfig, { enabled: true }>;

export interface MixpanelSink extends Sink {
  register(props: SinkProps): void;
  registerOnce(props: SinkProps): void;
  /** Stop all tracking and wipe what the SDK stored locally (consent withdrawn). */
  optOut(): void;
  /** Resume after a withdrawal in the same page life (does not send the SDK's `$opt_in` event). */
  optIn(): void;
}

/** Properties the SDK would add that can carry a full URL or referrer. */
export const BLOCKED_SDK_PROPERTIES = ["$current_url", "$referrer", "$initial_referrer", "current_url_search"] as const;

export function sdkConfig(cfg: EnabledConfig) {
  return {
    api_host: cfg.apiHost,
    api_transport: "XHR",
    batch_requests: true,
    batch_flush_interval_ms: 2000,
    persistence: "localStorage",
    opt_out_tracking_persistence_type: "localStorage",
    cross_subdomain_cookie: false,
    cross_site_cookie: false,
    secure_cookie: true,
    ip: false,
    ignore_dnt: false,
    autocapture: false,
    track_pageview: false,
    record_sessions_percent: 0,
    flags: false,
    store_google: false,
    stop_utm_persistence: true,
    skip_first_touch_marketing: true,
    track_marketing: false,
    save_referrer: false,
    property_blacklist: [...BLOCKED_SDK_PROPERTIES],
    debug: false,
    verbose: false,
  } as const;
}

declare global {
  // Survives hot reloads / duplicate module evaluation: init runs once per document.
  var __ptMixpanel: MixpanelSink | undefined;
}

export async function createMixpanelSink(cfg: EnabledConfig): Promise<MixpanelSink> {
  if (globalThis.__ptMixpanel) return globalThis.__ptMixpanel;
  const { default: mixpanel } = await import("mixpanel-browser");
  if (globalThis.__ptMixpanel) return globalThis.__ptMixpanel; // lost a race with a second start()
  mixpanel.init(cfg.token, sdkConfig(cfg) as unknown as Parameters<typeof mixpanel.init>[1]);
  const sink: MixpanelSink = {
    track: (name, props) => void mixpanel.track(name, props),
    register: (props) => mixpanel.register(props),
    registerOnce: (props) => mixpanel.register_once(props),
    optIn: () => mixpanel.opt_in_tracking({ track: () => undefined }),
    optOut: () => mixpanel.opt_out_tracking({ delete_user: false }), // clear_persistence defaults to true: the SDK wipes its local data
  };
  globalThis.__ptMixpanel = sink;
  return sink;
}
