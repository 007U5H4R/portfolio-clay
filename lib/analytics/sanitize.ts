/**
 * Everything that turns the page's URL / referrer into analytics properties (TASK-194). The rule is an
 * ALLOW-list: only `utm_*` campaign values in a restricted charset survive; no other query key, no
 * fragment, no full URL, and no referrer path ever leaves the browser (only the referrer's host).
 */
export const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;
export type UtmKey = (typeof UTM_KEYS)[number];
export type Utm = Partial<Record<UtmKey, string>>;

const UTM_VALUE = /^[A-Za-z0-9][A-Za-z0-9 _.\-+:/]{0,99}$/;

/**
 * The UTM parameters of a query string, lower-cased, each ≤ 100 chars of `[A-Za-z0-9 _.-+:/]`. A value
 * that looks like an email, a token or anything else outside that set is dropped, not trimmed.
 */
export function sanitizeUtm(search: string): Utm {
  const out: Utm = {};
  let params: URLSearchParams;
  try {
    params = new URLSearchParams(search);
  } catch {
    return out;
  }
  for (const key of UTM_KEYS) {
    const raw = params.get(key)?.trim();
    if (raw && UTM_VALUE.test(raw) && !raw.includes("@")) out[key] = raw.toLowerCase();
  }
  return out;
}

/** A referrer reduced to its host (`www.linkedin.com`), or null when absent/invalid/same-site. */
export function referrerHost(referrer: string, ownHost: string): string | null {
  if (!referrer) return null;
  try {
    const host = new URL(referrer).hostname.toLowerCase().replace(/^www\./, "");
    if (!host || host === ownHost.toLowerCase().replace(/^www\./, "")) return null;
    return host.slice(0, 80);
  } catch {
    return null;
  }
}

/** A destination host for outbound-link events: `drive.google.com`; never a path or query. */
export function destinationDomain(href: string, base: string): string | null {
  try {
    const url = new URL(href, base);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.hostname.toLowerCase().replace(/^www\./, "").slice(0, 80);
  } catch {
    return null;
  }
}

/** The canonical path of a page: no query, no fragment, no trailing slash (except "/"), lower-case, length-bounded. */
export function canonicalPath(pathname: string): string {
  const base = pathname.split(/[?#]/)[0] ?? "/";
  const trimmed = base.length > 1 ? base.replace(/\/+$/, "") : base;
  return (trimmed || "/").toLowerCase().slice(0, 120);
}
