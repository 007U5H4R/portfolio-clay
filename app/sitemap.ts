import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";
import { projects } from "@/data/projects";
import { writing } from "@/data/writing";
import { isListed } from "@/lib/portfolio";

/** Public top-level routes that are shipped in this build. */
export const STATIC_ROUTES = ["/", "/work", "/projects", "/about", "/thinking", "/contact", "/certifications", "/card"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const lastModified = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: path === "/" ? base : `${base}${path}`,
    lastModified,
  }));

  // Only listed personal builds are public index candidates.
  const projectEntries: MetadataRoute.Sitemap = projects
    .filter(isListed)
    .map((project) => ({ url: `${base}/work/${project.slug}`, lastModified }));

  // Draft essays are deliberately excluded until they are reviewed and published.
  const essayEntries: MetadataRoute.Sitemap = writing
    .filter((essay) => !essay.draft)
    .map((essay) => ({ url: `${base}/thinking/${essay.slug}`, lastModified }));

  return [...staticEntries, ...projectEntries, ...essayEntries];
}
