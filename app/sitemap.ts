import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";
import { projects } from "@/data/projects";
import { writing } from "@/data/writing";

/**
 * Top-level routes actually shipped in this build (technical-plan.md §A8/§B S06.05). The sitemap
 * must never list a route that doesn't exist yet — `/about`, `/playground` land with TKT-40/44
 * respectively; each of those tickets appends its route here once the page ships. `/thinking` lands
 * with TKT-43 (this ticket). (`lib/anchors.ts`'s broader `STATIC_ROUTES` is a *link-validation* set
 * for authored copy, not a "page exists" set, so it isn't reused here.)
 */
export const STATIC_ROUTES = ["/", "/work", "/thinking", "/contact", "/playground"] as const;

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

  // TKT-43: the 5 DRAFT essays each get a `/thinking/<slug>` sitemap entry too — nothing in the
  // route or the sitemap ever labels an essay "published"; the DRAFT tag lives on the pages
  // themselves. Imported from `@/data/writing` directly (not `@/data`/`data/index.ts`) so this
  // route doesn't transitively pull in `scripts/forbidden-strings.ts`'s filesystem walk, which
  // Next's build flags as tracing the whole project into this route.
  const essayEntries: MetadataRoute.Sitemap = writing.map((essay) => ({
    url: `${base}/thinking/${essay.slug}`,
    lastModified,
  }));

  return [...staticEntries, ...projectEntries, ...essayEntries];
}
