import type { Metadata } from "next";
import { site } from "@/lib/site";

/**
 * Absolute HTTPS site origin (technical-plan.md §A1 env chain), no trailing slash:
 *   1. `NEXT_PUBLIC_SITE_URL`               — set on production only (A11); expected to already
 *                                              carry its own scheme (`https://…`).
 *   2. `https://${VERCEL_PROJECT_PRODUCTION_URL}` — Vercel's bare production hostname.
 *   3. `https://${VERCEL_URL}`              — Vercel's bare preview-deployment hostname, so OG/
 *                                              canonical tags still resolve to a real, absolute
 *                                              HTTPS URL on preview deploys (A11).
 *   4. `http://localhost:3000`              — local dev/build fallback.
 * Every OG/Twitter/canonical URL in `buildMetadata()` is built from this so link previews always
 * carry an absolute URL (Global Web Deliverables rule / EVAL-017).
 */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");

  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (productionHost) return `https://${productionHost}`;

  const previewHost = process.env.VERCEL_URL;
  if (previewHost) return `https://${previewHost}`;

  return "http://localhost:3000";
}

export interface BuildMetadataInput {
  /** Full browser-tab title (e.g. "Work · Tushar Pathak") — rendered verbatim, bypassing the root layout's title template. */
  title: string;
  description: string;
  /** Route path, e.g. "/", "/work/teachspark". */
  path: string;
  /** Human label for the OG image's alt text — one per page family (e.g. "Selected Work", "TeachSpark case study"). */
  ogFamily: string;
  /**
   * Absolute or root-relative OG/Twitter image override. Defaults to this route's co-located
   * `opengraph-image` file-convention route (`<path>/opengraph-image`, or `/opengraph-image` for
   * the home path) — technical-plan.md §A8.
   */
  image?: string;
  type?: "website" | "article";
}

/** Title/description/canonical/OG/Twitter builder (technical-plan.md §A8) — every absolute-URL
 * field is constructed here (not left to Next's `metadataBase` resolution) so the raw return
 * value is already correct for direct unit testing and for consumers that read it before render. */
export function buildMetadata({
  title,
  description,
  path,
  ogFamily,
  image,
  type = "website",
}: BuildMetadataInput): Metadata {
  const base = siteUrl();
  const url = path === "/" ? base : `${base}${path}`;
  const imagePath = image ?? (path === "/" ? "/opengraph-image" : `${path}/opengraph-image`);
  const imageUrl = /^https?:\/\//.test(imagePath) ? imagePath : `${base}${imagePath}`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      type,
      url,
      title,
      description,
      siteName: site.name,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: ogFamily }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}
