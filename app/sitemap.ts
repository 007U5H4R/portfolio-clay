import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";
import { projects } from "@/data/projects";

/**
 * Top-level routes actually shipped in this build (technical-plan.md §A8/§B S06.05). The sitemap
 * must never list a route that doesn't exist yet — `/about`, `/thinking`, `/playground` land with
 * TKT-40/43/44 respectively; each of those tickets appends its route here once the page ships.
 * (`lib/anchors.ts`'s broader `STATIC_ROUTES` is a *link-validation* set for authored copy, not a
 * "page exists" set, so it isn't reused here.)
 */
export const STATIC_ROUTES = ["/", "/work", "/contact"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const lastModified = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: path === "/" ? base : `${base}${path}`,
    lastModified,
  }));

  // Personal builds only (professional experience entries have no `/work/<slug>` page — SITEMAP.md).
  const projectEntries: MetadataRoute.Sitemap = projects
    .filter((project) => project.category === "personal")
    .map((project) => ({ url: `${base}/work/${project.slug}`, lastModified }));

  // `data/writing.ts` doesn't exist yet (essays land with TKT-43); that ticket adds a third
  // `essays.map(e => ({ url: \`${base}/thinking/${e.slug}\`, lastModified }))` block here.
  // (Deliberately not importing `@/data` (validateAll's `data/index.ts`) to get an always-empty
  // `collections.writing` today — it transitively pulls in `scripts/forbidden-strings.ts`'s
  // filesystem walk, which Next's build flags as tracing the whole project into this route.)

  return [...staticEntries, ...projectEntries];
}
