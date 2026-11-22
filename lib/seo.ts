import type { Metadata } from "next";
import { OG_HOME_ALT, OG_IMAGE_PATH } from "@/lib/og-home";
import { site } from "@/lib/site";

/**
 * Absolute HTTPS site origin (technical-plan.md §A1 env chain), no trailing slash:
 *   1. NEXT_PUBLIC_SITE_URL — explicit canonical origin, when configured.
 *   2. Vercel preview URL — keep preview metadata isolated from production.
 *   3. https://tusharpathak.com — the public portfolio's canonical domain.
 * The custom domain is the production identity; Vercel deployment hostnames must not
 * become the canonical URLs when the explicit environment variable is absent.
 */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");

  const previewHost = process.env.VERCEL_URL;
  if (previewHost && process.env.VERCEL_ENV !== "production") {
    return `https://${previewHost}`;
  }

  return "https://tusharpathak.com";
}

export interface BuildMetadataInput {
  /** Full browser-tab title (e.g. "Work · Tushar Pathak") — rendered verbatim, bypassing the root layout's title template. */
  title: string;
  description: string;
  /** Route path, e.g. "/", "/work/teachspark". */
  path: string;
  type?: "website" | "article";
  /** Unlisted pages stay reachable by link but ask crawlers not to index them (links still followed). */
  noindex?: boolean;
  /** A route-specific share card. Omitted = the shared og.jpg. */
  image?: { path: string; alt: string };
}

/** Title/description/canonical/OG/Twitter builder. */
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
