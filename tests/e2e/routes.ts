/**
 * routes.ts (technical-plan.md §B S09.03) — the single source of routes for the eval harness.
 *
 * `STATIC_ROUTES` is the committed list from routes.json (the public routes built so far). The
 * axe/overflow/target sweeps import it directly for their synchronous `for (const route …)` test
 * generation. `loadRoutes()` is the runtime resolver used by the crawler (TKT-07b): it PREFERS a
 * live `/sitemap.xml` (HTTP 200 with ≥1 <loc>) over the static file, so new pages are covered
 * automatically once they land in the sitemap, and falls back to the static list when the sitemap
 * is missing, non-200, empty, or the fetch throws (PB1: the crawler never waits on the visual gate,
 * and the sitemap has existed since TKT-06).
 *
 * The loader is pure and fetch-injectable so its fallback ORDER is unit-tested (tests/unit/routes.test.ts)
 * without a running server.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export interface RoutesFile {
  static: string[];
  dev: string[];
}

function readRoutesFile(): RoutesFile {
  const path = resolve(process.cwd(), "tests/e2e/routes.json");
  const parsed = JSON.parse(readFileSync(path, "utf8")) as Partial<RoutesFile>;
  return {
    static: parsed.static ?? [],
    dev: parsed.dev ?? [],
  };
}

const FILE = readRoutesFile();

/** Public routes built as of M-002 — the default sweep set. */
export const STATIC_ROUTES: readonly string[] = FILE.static;

/** QA-only routes, reachable only under ALLOW_DEV_ROUTES=1 pnpm start. */
export const DEV_ROUTES: readonly string[] = FILE.dev;

/** Minimal fetch shape the loader needs — lets a test inject a fake without a server. */
export type FetchLike = (
  url: string,
) => Promise<{ ok: boolean; status: number; text: () => Promise<string> }>;

export interface LoadRoutesOptions {
  baseUrl?: string;
  /** Injected for tests; defaults to global fetch. */
  fetchImpl?: FetchLike;
  /** Append DEV_ROUTES (QA runs). */
  includeDev?: boolean;
}

function dedupe(paths: string[]): string[] {
  return [...new Set(paths)];
}

/** Parse `<loc>` pathnames out of a sitemap XML string. */
function parseSitemapPaths(xml: string): string[] {
  const paths: string[] = [];
  for (const m of xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)) {
    const raw = m[1]!;
    try {
      paths.push(new URL(raw).pathname);
    } catch {
      // Relative <loc> (rare) — use as-is.
      if (raw.startsWith("/")) paths.push(raw);
    }
  }
  return dedupe(paths);
}

/**
 * Resolve the route list, preferring the live sitemap over the static file. Fallback order:
 *   1. GET {baseUrl}/sitemap.xml → 200 with ≥1 <loc>  ⇒ the sitemap's pathnames
 *   2. otherwise (non-200, empty, or fetch throws)     ⇒ STATIC_ROUTES
 * DEV_ROUTES are appended only when `includeDev` is set (they never appear in the sitemap).
 */
export async function loadRoutes(opts: LoadRoutesOptions = {}): Promise<string[]> {
  const baseUrl = opts.baseUrl ?? "http://127.0.0.1:3000";
  const fetchImpl = opts.fetchImpl ?? (globalThis.fetch as unknown as FetchLike);

  let routes: string[] = [...STATIC_ROUTES];
  try {
    const res = await fetchImpl(`${baseUrl}/sitemap.xml`);
    if (res.ok && res.status === 200) {
      const fromSitemap = parseSitemapPaths(await res.text());
      if (fromSitemap.length > 0) routes = fromSitemap;
    }
  } catch {
    // keep the static fallback
  }

  return opts.includeDev ? dedupe([...routes, ...DEV_ROUTES]) : routes;
}
