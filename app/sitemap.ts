import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";
import { projects } from "@/data/projects";
import { writing } from "@/data/writing";
import { isListed } from "@/lib/portfolio";

/**
 * Top-level routes actually shipped in this build (technical-plan.md §A8/§B S06.05). The sitemap
 * must never list a route that doesn't exist yet. All M-006 pages have now shipped: `/about`
 * (TKT-40/42), `/thinking` (TKT-43) — each is listed here. (`/playground` (TKT-44) was retired by TASK-249 → `/projects`.) (`/about` was
 * missing until the M-006 phase-gate sweep added it.) (`lib/anchors.ts`'s broader `STATIC_ROUTES`
 * is a *link-validation* set for authored copy, not a "page exists" set, so it isn't reused here.)
 */
// TKT-101: `/projects` (the project index, moved from `/work`); `/work` is now the Experience page. TKT-102 adds /certifications.
export const STATIC_ROUTES = ["/", "/work", "/projects", "/about", "/thinking", "/contact", "/certifications", "/card"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const lastModified = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: path === "/" ? base : `${base}${path}`,
    lastModified,
  }));

  // Listed personal builds only (professional experience entries have no `/work/<slug>` page — SITEMAP.md).
  // TASK-249 (Tushar 2026-10-18): unlisted builds keep a noindex case-study page but stay out of the sitemap.
  const projectEntries: MetadataRoute.Sitemap = projects
    .filter(isListed)
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
