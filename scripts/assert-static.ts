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
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const NEXT_DIR = resolve(HERE, "../.next");

const INTERNAL = new Set(["/_not-found", "/_global-error"]);

type PrerenderManifest = {
  routes?: Record<string, unknown>;
  dynamicRoutes?: Record<string, unknown>;
};

function readJson<T>(path: string): T {
  try {
    return JSON.parse(readFileSync(path, "utf8")) as T;
  } catch (err) {
    console.error(`assert-static: could not read ${path} — did \`next build\` run first?`);
    console.error(String(err));
    process.exit(1);
  }
}

const appRoutes = readJson<Record<string, string>>(
  resolve(NEXT_DIR, "app-path-routes-manifest.json"),
);
const prerender = readJson<PrerenderManifest>(resolve(NEXT_DIR, "prerender-manifest.json"));

const staticRoutes = new Set(Object.keys(prerender.routes ?? {}));
const dynamicRoutes = new Set(Object.keys(prerender.dynamicRoutes ?? {}));

// App pages are the manifest keys ending in `/page`; the value is the route path.
const pages = Object.entries(appRoutes)
  .filter(([key]) => key.endsWith("/page"))
  .map(([, route]) => route)
  .filter((route) => !INTERNAL.has(route));

const offenders = pages.filter(
  (route) => !staticRoutes.has(route) && !dynamicRoutes.has(route),
);

if (offenders.length > 0) {
  console.error("assert-static: the following app routes are NOT statically prerendered:");
  for (const route of offenders) console.error(`  - ${route}`);
  console.error("SSG guarantee (TP1) violated — every app route must be prerendered.");
  process.exit(1);
}

console.log(`all routes static (${pages.length})`);
