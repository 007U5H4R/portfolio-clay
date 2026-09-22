/**
 * crawler.ts (technical-plan.md §B S10.01–03, EVAL-011) — the dead-control crawler core.
 *
 * For every visible control on a page it decides one honest verdict — `ok`, `warn`, or `dead`:
 *   • a[href] internal        → GET 200–299 and, for a `#hash`, the target id must exist on the page
 *   • a[href] to a KNOWN-unbuilt route (nav /thinking, /about) → WARN with the owning ticket, not FAIL
 *   • a[href] external (http)  → HEAD 200–399 (cached, ≤2 concurrent, 10 s timeout, retry once on
 *                                429/5xx); a 403 from LinkedIn/GitHub bot-blocking is WARN, not FAIL
 *   • mailto:                  → a syntactically valid address
 *   • #hash (same page)        → the target id must exist
 *   • button / [role=button]   → clicking produces an observable change (URL / aria-state /
 *                                dialog[open] / DOM mutation), else it is a DEAD control
 *   • aria-disabled="true"     → must be on crawler-allowlist.json (else DEAD)
 *   • any control with no accessible name → DEAD (EVAL-011 accessibility requirement)
 *
 * The external/internal fetch cache and the 2-slot semaphore live at module scope so a whole run
 * (every route × width) shares them — running the crawler twice in a row hits the cache (S10.03 gate).
 * Everything network-facing runs in Node (Playwright/global fetch), never in page context.
 */
import type { ElementHandle, Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// --------------------------------------------------------------------------- types
export type Verdict = "ok" | "warn" | "dead";

export interface ControlResult {
  route: string;
  width: number;
  kind: "internal-link" | "external-link" | "mailto" | "hash-link" | "button" | "unknown";
  name: string;
  target: string;
  verdict: Verdict;
  detail: string;
}

export interface AllowlistEntry {
  id: string;
  selector: string;
  reason: string;
  expires?: string;
}

/**
 * Internal routes that legitimately 404 during M-002 because the page ships in a later milestone.
 * A link to one of these is WARN (with the owning ticket), not a dead-link FAIL — matching how the
 * whole harness treats not-yet-built routes. Remove an entry when its route lands.
 */
export const KNOWN_UNBUILT: Record<string, string> = {
  "/thinking": "TKT-41 (Thinking index, M-005)",
  "/about": "TKT-40 (About, M-006)",
};

const CRAWL_UA = "portfolio-clay-crawler";
const EXTERNAL_TIMEOUT_MS = 10_000;
// doi.org / pubs.acs.org (ACS Publications, the DOI redirect target for the Langmuir credential in
// data/credentials.ts) return a Cloudflare bot-challenge (`cf-mitigated: challenge`) 403 to an
// automated HEAD — the link is genuinely live for a human, just bot-blocked, exactly like LinkedIn.
const BOT_BLOCK_HOSTS = ["linkedin.com", "github.com", "doi.org", "pubs.acs.org"];
// Statuses these hosts return to automated clients instead of serving the page: 403/429 (Forbidden
// / Too Many Requests) and LinkedIn's signature 999. From a bot-block host these are WARN (the link
// is fine for a human), never a dead-link FAIL — the status is recorded either way.
const BOT_BLOCK_STATUSES = [403, 429, 999];

// --------------------------------------------------------------------------- allowlist
export function loadAllowlist(): AllowlistEntry[] {
  const path = resolve(process.cwd(), "tests/e2e/crawler-allowlist.json");
  return JSON.parse(readFileSync(path, "utf8")) as AllowlistEntry[];
}

// --------------------------------------------------------------------------- fetch cache + semaphore
interface FetchOutcome {
  verdict: Verdict;
  status: number | null;
  detail: string;
}
const fetchCache = new Map<string, FetchOutcome>();

let active = 0;
const waiters: (() => void)[] = [];
async function acquire(): Promise<void> {
  if (active < 2) {
    active++;
    return;
  }
  await new Promise<void>((r) => waiters.push(r));
  active++;
}
function release(): void {
  active--;
  const next = waiters.shift();
  if (next) next();
}

/** For tests: forget every cached fetch outcome. */
export function resetCache(): void {
  fetchCache.clear();
}
/** For tests/reporting: was this URL served from cache on the last check? */
export function cacheHas(url: string): boolean {
  return fetchCache.has(url);
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function isBotBlockHost(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return BOT_BLOCK_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
  } catch {
    return false;
  }
}

async function headOnce(url: string, method: "HEAD" | "GET"): Promise<Response> {
  return fetch(url, {
    method,
    redirect: "follow",
    headers: { "user-agent": CRAWL_UA },
    signal: AbortSignal.timeout(EXTERNAL_TIMEOUT_MS),
  });
}

/**
 * True for the abort/timeout error thrown when `AbortSignal.timeout(EXTERNAL_TIMEOUT_MS)` fires —
 * Node's fetch (undici) throws a `DOMException`/`Error` named `TimeoutError` or `AbortError`
 * depending on runtime. A timeout means "this bot couldn't confirm it in N seconds" (the external
 * host may still be perfectly live for a human), never "the link is dead" — same class of leniency
 * as the existing `BOT_BLOCK_STATUSES` → WARN handling (EVAL-011 robustness, CF-1).
 */
export function isTimeoutError(err: unknown): boolean {
  const name = (err as { name?: string } | undefined)?.name;
  return name === "AbortError" || name === "TimeoutError";
}

/**
 * Check an external URL. HEAD first (falling back to GET on 405), retry once after 2 s on 429/5xx.
 * 200–399 ⇒ ok; 403 from a known bot-blocking host ⇒ warn; a timeout ⇒ warn (unconfirmed, not dead);
 * anything else ⇒ dead. Cached per run.
 */
export async function checkExternal(url: string): Promise<FetchOutcome> {
  const cached = fetchCache.get(url);
  if (cached) return { ...cached, detail: `${cached.detail} (cached)` };

  await acquire();
  let outcome: FetchOutcome;
  try {
    let res: Response;
    try {
      res = await headOnce(url, "HEAD");
      if (res.status === 405) res = await headOnce(url, "GET");
    } catch (err) {
      outcome = isTimeoutError(err)
        ? { verdict: "warn", status: null, detail: `timeout after ${EXTERNAL_TIMEOUT_MS}ms — unconfirmed, not dead` }
        : { verdict: "dead", status: null, detail: `fetch error: ${(err as Error).message}` };
      fetchCache.set(url, outcome);
      return outcome;
    }
    if (res.status === 429 || res.status >= 500) {
      await sleep(2000);
      try {
        res = await headOnce(url, "HEAD");
        if (res.status === 405) res = await headOnce(url, "GET");
      } catch {
        /* keep the first response's status below */
      }
    }
    const s = res.status;
    if (s >= 200 && s <= 399) {
      outcome = { verdict: "ok", status: s, detail: `HTTP ${s}` };
    } else if (isBotBlockHost(url) && BOT_BLOCK_STATUSES.includes(s)) {
      outcome = { verdict: "warn", status: s, detail: `HTTP ${s} bot-block (${new URL(url).hostname}) — recorded, not FAIL` };
    } else {
      outcome = { verdict: "dead", status: s, detail: `HTTP ${s}` };
    }
  } finally {
    release();
  }
  fetchCache.set(url, outcome);
  return outcome;
}

/** Fetch an internal URL (GET, same-origin) and return its status + body for hash-target checks. */
async function getInternal(url: string): Promise<{ status: number; body: string } | null> {
  await acquire();
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: { "user-agent": CRAWL_UA },
      signal: AbortSignal.timeout(EXTERNAL_TIMEOUT_MS),
    });
    const body = await res.text();
    return { status: res.status, body };
  } catch {
    return null;
  } finally {
    release();
  }
}

function bodyHasId(body: string, id: string): boolean {
  // Escape the id for a literal attribute-value match (id/name).
  const esc = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:id|name)=["']${esc}["']`).test(body);
}

// --------------------------------------------------------------------------- href classification
export interface HrefClass {
  kind: ControlResult["kind"];
  path: string; // pathname for internal, full url for external, address for mailto
  hash: string; // without the leading '#'
}
/** Pure URL classification (unit-testable without a browser). */
export function classifyHref(href: string, pageUrl: string): HrefClass {
  if (href.startsWith("mailto:")) return { kind: "mailto", path: href.slice("mailto:".length), hash: "" };
  if (href.startsWith("tel:")) return { kind: "unknown", path: href, hash: "" };
  let u: URL;
  try {
    u = new URL(href, pageUrl);
  } catch {
    return { kind: "unknown", path: href, hash: "" };
  }
  const origin = new URL(pageUrl).origin;
  const hash = u.hash.startsWith("#") ? u.hash.slice(1) : "";
  if (u.protocol === "http:" || u.protocol === "https:") {
    if (u.origin === origin) {
      // Same-origin. A bare hash on the current page is a hash-link.
      const samePage = u.pathname === new URL(pageUrl).pathname;
      if (hash && samePage) return { kind: "hash-link", path: u.pathname, hash };
      return { kind: "internal-link", path: u.pathname, hash };
    }
    return { kind: "external-link", path: u.toString(), hash };
  }
  return { kind: "unknown", path: href, hash: "" };
}

function validEmail(addr: string): boolean {
  const bare = addr.split("?")[0] ?? addr;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bare);
}

// --------------------------------------------------------------------------- control props (in-page)
interface RawControl {
  tag: string;
  role: string | null;
  href: string | null;
  ariaDisabled: boolean;
  name: string;
  ariaExpanded: string | null;
  ariaPressed: string | null;
  ariaSelected: string | null;
}

const CONTROL_SELECTOR = "a[href], button, [role=button], [role=tab], [role=link]";

async function readRaw(handle: ElementHandle<Element>): Promise<RawControl> {
  return handle.evaluate((el) => {
    const name = (
      el.getAttribute("aria-label") ||
      (el as HTMLElement).innerText ||
      el.textContent ||
      el.getAttribute("title") ||
      ""
    )
      .trim()
      .replace(/\s+/g, " ")
      .slice(0, 60);
    return {
      tag: el.tagName.toLowerCase(),
      role: el.getAttribute("role"),
      href: el.getAttribute("href"),
      ariaDisabled: el.getAttribute("aria-disabled") === "true",
      name,
      ariaExpanded: el.getAttribute("aria-expanded"),
      ariaPressed: el.getAttribute("aria-pressed"),
      ariaSelected: el.getAttribute("aria-selected"),
    };
  });
}

async function isVisible(handle: ElementHandle<Element>): Promise<boolean> {
  return handle.evaluate((el) => {
    const style = getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  });
}

// --------------------------------------------------------------------------- button observation
/** path+search of a URL, stripping any `#fragment` — used to tell a real navigation (pushed
 * history entry, or a change to what's actually loaded) apart from an in-page hash-only sync
 * (e.g. `history.replaceState` used to reflect deep-link state, which legitimately changes
 * `location.href` without navigating anywhere). */
function stripHash(url: string): string {
  try {
    const u = new URL(url);
    return u.origin + u.pathname + u.search;
  } catch {
    return url;
  }
}

/**
 * Click a button-like control and report whether it produced an observable change. Restores state
 * afterwards (Esc to close any opened dialog, back-nav if a real navigation occurred). Exported
 * for the crawler self-test (S10.01 gate: a fixture dead button must be reported).
 */
export async function observeButtonEffect(
  page: Page,
  handle: ElementHandle<Element>,
): Promise<{ changed: boolean; how: string }> {
  const before = await handle.evaluate((el) => {
    (window as unknown as { __mut: number }).__mut = 0;
    const mo = new MutationObserver((muts) => {
      (window as unknown as { __mut: number }).__mut += muts.length;
    });
    mo.observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      characterData: true,
    });
    (window as unknown as { __mo: MutationObserver }).__mo = mo;
    return {
      url: location.href,
      historyLength: history.length,
      dialogs: document.querySelectorAll("dialog[open]").length,
      expanded: el.getAttribute("aria-expanded"),
      pressed: el.getAttribute("aria-pressed"),
      selected: el.getAttribute("aria-selected"),
    };
  });

  let clickError = "";
  try {
    await handle.click({ timeout: 2000, noWaitAfter: true });
  } catch (err) {
    clickError = (err as Error).message.split("\n")[0] ?? "click failed";
  }
  await page.waitForTimeout(500);

  const after = await page
    .evaluate(
      ({ prevExpanded, prevPressed, prevSelected }) => {
        const mo = (window as unknown as { __mo?: MutationObserver }).__mo;
        if (mo) mo.disconnect();
        return {
          url: location.href,
          historyLength: history.length,
          dialogs: document.querySelectorAll("dialog[open]").length,
          mut: (window as unknown as { __mut: number }).__mut ?? 0,
          // aria-* re-read against the same element is not reliable after DOM churn, so we compare
          // the values we captured pre-click below using the element handle instead.
          _p: [prevExpanded, prevPressed, prevSelected],
        };
      },
      { prevExpanded: before.expanded, prevPressed: before.pressed, prevSelected: before.selected },
    )
    .catch(() => ({ url: before.url, historyLength: before.historyLength, dialogs: before.dialogs, mut: 0, _p: [] }));

  // Re-read the element's aria-* (handle may still be attached).
  const ariaAfter = await handle
    .evaluate((el) => ({
      expanded: el.getAttribute("aria-expanded"),
      pressed: el.getAttribute("aria-pressed"),
      selected: el.getAttribute("aria-selected"),
    }))
    .catch(() => ({ expanded: before.expanded, pressed: before.pressed, selected: before.selected }));

  const urlChanged = after.url !== before.url;
  // A REAL navigation either pushes a history entry (historyLength grows) or changes what's
  // actually loaded (path+search, ignoring `#fragment`). A control that only syncs the hash via
  // `history.replaceState` (e.g. a deep-link sync on open) changes `location.href` — so
  // `urlChanged` above is still true, correctly counting it as an observable effect — but does
  // NOT navigate anywhere and must not trigger `goBack()`, which would instead pop the crawler's
  // own prior real navigation and corrupt the rest of the crawl.
  const realNavigation = after.historyLength > before.historyLength || stripHash(after.url) !== stripHash(before.url);
  const dialogOpened = after.dialogs > before.dialogs;
  const ariaToggled =
    ariaAfter.expanded !== before.expanded ||
    ariaAfter.pressed !== before.pressed ||
    ariaAfter.selected !== before.selected;
  const mutated = after.mut > 0;

  const reasons: string[] = [];
  if (urlChanged) reasons.push("URL changed");
  if (dialogOpened) reasons.push("dialog opened");
  if (ariaToggled) reasons.push("aria-state toggled");
  if (mutated) reasons.push(`${after.mut} DOM mutations`);
  const changed = urlChanged || dialogOpened || ariaToggled || mutated;

  // Restore: close any dialog we opened, undo any REAL navigation (not a hash-only replaceState).
  if (dialogOpened) {
    await page.keyboard.press("Escape").catch(() => {});
    await page.waitForTimeout(100);
  }
  if (realNavigation) {
    await page.goBack({ waitUntil: "load" }).catch(() => {});
  }

  return {
    changed,
    how: changed ? reasons.join(", ") : clickError ? `no change (${clickError})` : "no observable effect",
  };
}

// --------------------------------------------------------------------------- classify one control
export async function classifyControl(
  page: Page,
  handle: ElementHandle<Element>,
  ctx: {
    route: string;
    width: number;
    baseUrl: string;
    allowlist: AllowlistEntry[];
    buttonMode?: "click" | "skip";
  },
): Promise<ControlResult | null> {
  if (!(await isVisible(handle))) return null;
  const raw = await readRaw(handle);
  const base: Omit<ControlResult, "kind" | "verdict" | "detail" | "target"> = {
    route: ctx.route,
    width: ctx.width,
    name: raw.name,
  };

  // aria-disabled → must be allowlisted.
  if (raw.ariaDisabled) {
    let matched: AllowlistEntry | undefined;
    for (const entry of ctx.allowlist) {
      const ok = await handle.evaluate((el, sel) => el.matches(sel), entry.selector).catch(() => false);
      if (ok) {
        matched = entry;
        break;
      }
    }
    if (matched) {
      return {
        ...base,
        kind: raw.href ? "internal-link" : "button",
        target: raw.href ?? "(aria-disabled)",
        verdict: "warn",
        detail: `aria-disabled, allowlisted (${matched.id}, expires ${matched.expires ?? "—"}): ${matched.reason}`,
      };
    }
    return {
      ...base,
      kind: raw.href ? "internal-link" : "button",
      target: raw.href ?? "(aria-disabled)",
      verdict: "dead",
      detail: "aria-disabled with no crawler-allowlist entry",
    };
  }

  // Missing accessible name is a dead control (EVAL-011 a11y requirement).
  if (!raw.name) {
    return { ...base, kind: "unknown", target: raw.href ?? "(no href)", verdict: "dead", detail: "no accessible name" };
  }

  // Links.
  if (raw.href !== null && raw.href !== "") {
    const cls = classifyHref(raw.href, page.url());
    if (cls.kind === "mailto") {
      const ok = validEmail(cls.path);
      return {
        ...base,
        kind: "mailto",
        target: raw.href,
        verdict: ok ? "ok" : "dead",
        detail: ok ? "valid mailto address" : "invalid mailto address",
      };
    }
    if (cls.kind === "external-link") {
      const r = await checkExternal(cls.path);
      return { ...base, kind: "external-link", target: cls.path, verdict: r.verdict, detail: r.detail };
    }
    if (cls.kind === "hash-link") {
      // Resolve the target id in page context (getElementById needs no CSS-escaping and, unlike
      // `CSS.escape`, is available where the DOM is — CSS is not a Node global).
      const present = await page.evaluate((h) => !!document.getElementById(h), cls.hash);
      return {
        ...base,
        kind: "hash-link",
        target: raw.href,
        verdict: present ? "ok" : "dead",
        detail: present ? `#${cls.hash} target exists` : `#${cls.hash} target missing on ${ctx.route}`,
      };
    }
    if (cls.kind === "internal-link") {
      // Known unbuilt route → WARN with owner.
      const owner = KNOWN_UNBUILT[cls.path];
      const url = ctx.baseUrl + cls.path;
      const res = await getInternal(url);
      if (!res) {
        return { ...base, kind: "internal-link", target: cls.path, verdict: "dead", detail: "fetch failed" };
      }
      const status2xx = res.status >= 200 && res.status <= 299;
      if (!status2xx) {
        if (owner) {
          return {
            ...base,
            kind: "internal-link",
            target: cls.path,
            verdict: "warn",
            detail: `HTTP ${res.status} — not-yet-built route, owner ${owner}`,
          };
        }
        return { ...base, kind: "internal-link", target: cls.path, verdict: "dead", detail: `HTTP ${res.status}` };
      }
      // 200: if it carries a hash, that id must exist on the target page.
      if (cls.hash && !bodyHasId(res.body, cls.hash)) {
        return {
          ...base,
          kind: "internal-link",
          target: raw.href,
          verdict: "dead",
          detail: `#${cls.hash} target missing on ${cls.path}`,
        };
      }
      return {
        ...base,
        kind: "internal-link",
        target: raw.href,
        verdict: "ok",
        detail: cls.hash ? `HTTP 200, #${cls.hash} exists` : "HTTP 200",
      };
    }
    // tel: or unknown scheme — record, don't fail.
    return { ...base, kind: "unknown", target: raw.href, verdict: "warn", detail: "non-http scheme, not checked" };
  }

  // Buttons / role=button / role=tab without an href → must do something observable.
  // In "skip" mode (e.g. the open-MobileMenu pass, where clicking the close button would detach
  // the other controls mid-crawl) the caller verifies buttons explicitly, so omit them here.
  if (ctx.buttonMode === "skip") return null;
  const effect = await observeButtonEffect(page, handle);
  return {
    ...base,
    kind: "button",
    target: `${raw.tag}${raw.role ? `[role=${raw.role}]` : ""}`,
    verdict: effect.changed ? "ok" : "dead",
    detail: effect.how,
  };
}

// --------------------------------------------------------------------------- crawl a page
export interface CrawlOptions {
  route: string;
  width: number;
  baseUrl: string;
  allowlist: AllowlistEntry[];
  /** Restrict enumeration to controls inside this selector (used for the open MobileMenu pass). */
  scope?: string;
  /** "skip" omits button-click verification (caller verifies buttons explicitly). Default "click". */
  buttonMode?: "click" | "skip";
}

export async function crawlControls(page: Page, opts: CrawlOptions): Promise<ControlResult[]> {
  const scope = opts.scope ? `${opts.scope} ${CONTROL_SELECTOR}` : CONTROL_SELECTOR;
  const handles = await page.$$(scope);
  const results: ControlResult[] = [];
  for (const handle of handles) {
    const r = await classifyControl(page, handle, opts).catch(
      (err): ControlResult => ({
        route: opts.route,
        width: opts.width,
        kind: "unknown",
        name: "(error)",
        target: "",
        verdict: "dead",
        detail: `classify threw: ${(err as Error).message.split("\n")[0]}`,
      }),
    );
    if (r) results.push(r);
    await handle.dispose().catch(() => {});
  }
  return results;
}

/** Stable de-dupe key so the same link seen in header+footer or across passes counts once. */
export function dedupeKey(r: ControlResult): string {
  return `${r.route}|${r.width}|${r.kind}|${r.target}|${r.name}`;
}
