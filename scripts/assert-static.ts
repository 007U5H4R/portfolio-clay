/**
 * assert-static.ts (TP1) — SSG guarantee.
 *
 * Runs after `next build` (`build` = `next build && tsx scripts/assert-static.ts`). Reads the
 * build manifests and asserts every application page route is statically prerendered — i.e. it
 * appears in `prerender-manifest.json` as a static route, or as a dynamic route backed by
 * `generateStaticParams`. If any app page would be rendered on-demand at request time, it prints
 * the offending route(s) and exits 1.
 *
 * Permitted non-page entries (not counted, not required to be pages): Next internals
 * (`/_not-found`, `/_global-error`) and metadata/route handlers (`favicon.ico`, `opengraph-image`,
 * `sitemap`, `robots`), which are emitted as build-time assets.
 *
 * TASK-134 (Design.md §11 Dev-133): the site gains its first server functions. Exactly these route
 * handlers may be dynamic — `/api/tushky/speech` (Ask Tushky's voice, a Vercel Node function) and
 * `/api/dev/tushky-voice` (the voice audition tool, which 404s outside `pnpm dev`). Any OTHER
 * route handler that is not prerendered fails the build, exactly like a dynamic page; pages get no
 * exception at all.
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const NEXT_DIR = resolve(HERE, "../.next");

const INTERNAL = new Set(["/_not-found", "/_global-error"]);

/** The only routes allowed to run at request time (TASK-134). Never a page. */
export const DYNAMIC_ROUTE_ALLOWLIST: ReadonlySet<string> = new Set(["/api/tushky/speech", "/api/dev/tushky-voice"]);

export type PrerenderManifest = {
  routes?: Record<string, unknown>;
  dynamicRoutes?: Record<string, unknown>;
};

export interface StaticCheck {
  pages: string[];
  /** Pages that are not prerendered: always a failure. */
  dynamicPages: string[];
  /** Route handlers that are not prerendered and not allow-listed: a failure. */
  dynamicHandlers: string[];
  /** Allow-listed dynamic route handlers that exist in this build. */
  allowedHandlers: string[];
}

/** Pure check over the two manifests (unit-tested in tests/unit/assert-static.test.ts). */
export function checkStatic(appRoutes: Record<string, string>, prerender: PrerenderManifest): StaticCheck {
  const staticRoutes = new Set(Object.keys(prerender.routes ?? {}));
  const dynamicRoutes = new Set(Object.keys(prerender.dynamicRoutes ?? {}));
  const prerendered = (route: string) => staticRoutes.has(route) || dynamicRoutes.has(route);

  // App pages are the manifest keys ending in `/page`; the value is the route path.
  const pages = Object.entries(appRoutes)
    .filter(([key]) => key.endsWith("/page"))
    .map(([, route]) => route)
    .filter((route) => !INTERNAL.has(route));
  // Route handlers (API routes and metadata files) are the keys ending in `/route`.
  const handlers = Object.entries(appRoutes)
    .filter(([key]) => key.endsWith("/route"))
    .map(([, route]) => route);

  const dynamicHandlerRoutes = handlers.filter((route) => !prerendered(route));
  return {
    pages,
    dynamicPages: pages.filter((route) => !prerendered(route)),
    dynamicHandlers: dynamicHandlerRoutes.filter((route) => !DYNAMIC_ROUTE_ALLOWLIST.has(route)),
    allowedHandlers: dynamicHandlerRoutes.filter((route) => DYNAMIC_ROUTE_ALLOWLIST.has(route)),
  };
}

function readJson<T>(path: string): T {
  try {
    return JSON.parse(readFileSync(path, "utf8")) as T;
  } catch (err) {
    console.error(`assert-static: could not read ${path} — did \`next build\` run first?`);
    console.error(String(err));
    process.exit(1);
  }
}

function main(): void {
  const appRoutes = readJson<Record<string, string>>(resolve(NEXT_DIR, "app-path-routes-manifest.json"));
  const prerender = readJson<PrerenderManifest>(resolve(NEXT_DIR, "prerender-manifest.json"));
  const result = checkStatic(appRoutes, prerender);

  if (result.dynamicPages.length > 0) {
    console.error("assert-static: the following app routes are NOT statically prerendered:");
    for (const route of result.dynamicPages) console.error(`  - ${route}`);
    console.error("SSG guarantee (TP1) violated — every app route must be prerendered.");
    process.exit(1);
  }
  if (result.dynamicHandlers.length > 0) {
    console.error("assert-static: these route handlers run at request time but are not allow-listed:");
    for (const route of result.dynamicHandlers) console.error(`  - ${route}`);
    console.error(`Only ${[...DYNAMIC_ROUTE_ALLOWLIST].join(", ")} may be dynamic (TASK-134, Design.md §11 Dev-133).`);
    process.exit(1);
  }
  console.log(
    `all routes static (${result.pages.length})` +
      (result.allowedHandlers.length ? `; allow-listed server functions: ${result.allowedHandlers.join(", ")}` : ""),
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) main();
