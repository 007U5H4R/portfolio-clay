import type { Metadata } from "next";
import { AboutCta } from "@/components/about/AboutCta";
import { AboutHero } from "@/components/about/AboutHero";
import { Awards } from "@/components/about/Awards";
import { CapabilityClusters } from "@/components/about/CapabilityClusters";
import { Education } from "@/components/about/Education";
import { Impact } from "@/components/about/Impact";
import { Research } from "@/components/about/Research";
import { ExperienceTimeline } from "@/components/timeline/ExperienceTimeline";
import { ProductJourney } from "@/components/timeline/ProductJourney";
import { Container } from "@/components/layout/Container";
import { SceneOpener } from "@/components/paper/SceneOpener";
import { TornEdge } from "@/components/paper";
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
 * `/about` — assembled in Design.md §7.4 order (TKT-87):
 *   scene opener (TKT-95) → hero → product journey → capabilities → impact → experience →
 *   awards · research · education → page-foot CTA → band (the band footer comes from the layout).
 *
 * Slots marked "TKT-86" are owned by TKT-86 (`/about` part 1) — it rebuilds those components in
 * paper; this file only mounts them. Slots marked "TKT-87" are this ticket's.
 *
 * The proof section is ONE `<section>` (one EVAL-018 counting unit: torn + the patent "TP" stamp =
 * 2, §3.3) holding three labelled band rows; the `#awards` / `#research` / `#education` anchors
 * live on those rows.
 *
 * Route MUST stay statically prerendered (TP1): no dynamic data, no `searchParams` read.
 */
export default function AboutPage() {
  return (
    <>
      {/* TKT-95 scene opener (EXE-18), sized like the home banner (TKT-107, Dev-95) — focal point per scene in components/paper/scene-opener-frames.ts. */}
      <SceneOpener id="scene-about" priority />

      {/* ── TKT-86 slot · hero (section incl. the hero-under row) ── */}
      <AboutHero />
      {/* ── TKT-86 slot · product journey (section#journey) ── */}
      <ProductJourney />
      {/* ── TKT-86 slot · capabilities (section#capability-clusters) ── */}
      <CapabilityClusters />
      {/* ── TKT-86 slot · impact (section#impact) ── */}
      <Impact />

      {/* ── TKT-87 · experience (section#experience; `#experience-<id>` anchors per role) ── */}
      <ExperienceTimeline />

      {/* ── TKT-87 · awards · research · education (one paper-2 section) ── */}
      <section aria-label="Recognition, research and education" className="proof-s">
        <TornEdge fill="paper-2" />
        <div className="proof-body">
          <Container className="proof-wrap">
            <Awards />
            <Research />
            <Education />
          </Container>
        </div>
      </section>

      {/* ── TKT-87 · page-foot CTA (section#about-cta) ── */}
      <AboutCta />
    </>
  );
}
