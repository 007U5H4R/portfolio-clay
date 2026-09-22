import type { Metadata } from "next";
import { AboutHero } from "@/components/about/AboutHero";
import { ProductJourney } from "@/components/timeline/ProductJourney";
import { buildMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: `About · ${site.name}`,
  description:
    "Senior Product Manager and AI builder — the career arc from enterprise programs to AI-native products, and the experience behind it.",
  path: "/about",
  ogFamily: "About Tushar Pathak",
});

/**
 * `/about` (TSK-23, TKT-40, M-006): `AboutHero` (flat hero variant) → `ProductJourney` (decorative
 * reduced-scale connector line, 4 stages, reveal-only).
 *
 * Later tickets in the SAME milestone extend THIS page — do not build their sections here:
 *   - TSK-24 mounts the 4 capability clusters + `Impact` (`MetricCard` shape) after `ProductJourney`.
 *   - TKT-41 mounts `ExperienceTimeline` at the `id="experience"` anchor below (`/work`'s
 *     `ExperienceStrip` and Ask evidence deep-link to `/about#experience`).
 *   - TKT-42 adds Awards/Research/Education and owns `app/about/opengraph-image.tsx` — NOT added
 *     here.
 *
 * Route MUST stay statically prerendered (TP1): no dynamic data, no `searchParams` read, matching
 * `/work`'s discipline (`app/work/page.tsx`).
 */
export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <ProductJourney />
      {/* TSK-24 mounts capability clusters + Impact here, between ProductJourney and #experience. */}
      {/* TKT-41's ExperienceTimeline mounts at this anchor. */}
      <div id="experience" />
    </>
  );
}
