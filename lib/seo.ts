import type { Metadata } from "next";
import { OG_HOME_ALT, OG_IMAGE_PATH } from "@/lib/og-home";
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

  // Only a PRODUCTION build may self-reference the production host. Vercel sets
  // VERCEL_PROJECT_PRODUCTION_URL on preview builds too, so without this gate every preview's
  // canonical/og:url/og:image pointed at production — a 404 until the first production deploy
  // exists, and never the preview actually being shared/inspected (CR-002 / QA-006, Stage 9).
  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (productionHost && process.env.VERCEL_ENV === "production") return `https://${productionHost}`;

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
  type?: "website" | "article";
  /** TASK-249 (Tushar 2026-10-18): unlisted pages stay reachable by link but ask crawlers not to index them (links still followed). */
  noindex?: boolean;
  /** TASK-338: a route-specific share card (served by that route's `opengraph-image` file). Omitted = the shared og.jpg. */
  image?: { path: string; alt: string };
}

/** Title/description/canonical/OG/Twitter builder (technical-plan.md §A8) — every absolute-URL
 * field is constructed here (not left to Next's `metadataBase` resolution) so the raw return
 * value is already correct for direct unit testing and for consumers that read it before render. */
export function buildMetadata({
  title,
  description,
  path,
  type = "website",
  noindex = false,
  image,
}: BuildMetadataInput): Metadata {
  const base = siteUrl();
  const url = path === "/" ? base : `${base}${path}`;
  // TASK-227 (Tushar 2026-10-16): one share image for every link: no per-page cards, no override.
  // TASK-338: only /projects overrides it (DES-029), via `image`.
  const imageUrl = `${base}${image?.path ?? OG_IMAGE_PATH}`;
  const imageAlt = image?.alt ?? OG_HOME_ALT;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      type,
      url,
      title,
      description,
      siteName: site.name,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: imageUrl, alt: imageAlt }],
    },
  };
}
