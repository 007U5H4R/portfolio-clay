import type { Metadata } from "next";
import { AboutHero } from "@/components/about/AboutHero";
import { Awards } from "@/components/about/Awards";
import { CapabilityClusters } from "@/components/about/CapabilityClusters";
import { Education } from "@/components/about/Education";
import { Impact } from "@/components/about/Impact";
import { Research } from "@/components/about/Research";
import { ExperienceTimeline } from "@/components/timeline/ExperienceTimeline";
import { ProductJourney } from "@/components/timeline/ProductJourney";
import { ClayButton } from "@/components/clay/ClayButton";
import { Section } from "@/components/layout/Section";
import { buildMetadata } from "@/lib/seo";
import { resumeAction, site } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: `About · ${site.name}`,
  description:
    "Senior Product Manager and AI builder — the career arc from enterprise programs to AI-native products, and the experience behind it.",
  path: "/about",
  ogFamily: "About Tushar Pathak",
});

/**
 * `/about` (TSK-23, TSK-24, TKT-40, TKT-41, TKT-42, M-006, LAST ticket — this finalizes the page):
 * `AboutHero` (flat hero variant) → `ProductJourney` (decorative reduced-scale connector line, 4
 * stages, reveal-only) → `CapabilityClusters` ("What I Bring", 4 clusters) → `Impact` (numbers
 * with context, `MetricCard` shape) → `ExperienceTimeline` (`id="experience"`) → `Awards` →
 * `Research` → `Education` → page-foot CTAs + colophon — SITEMAP.md's `/about` row order exactly.
 *
 * The page-foot CTA row + colophon are inlined here rather than a new component: TKT-42's scope
 * lists only `Awards`/`Research`/`Education` + this file + the OG route (no dedicated CTA
 * component), and Footer already owns the reusable resume/LinkedIn/Let's-Talk row — this is a
 * second, page-local instance per SITEMAP.md line 38 ("resume reachable from … `/about`").
 * `resumeAction()` is the single source of truth for the resume control (PB5) — never hard-coded.
 * The colophon text is decision TP10's exact wording ("Designed and built with Claude Code") — the
 * footer's own credit line stays "Built with curiosity." and must never say this (layout.spec.ts).
 *
 * Route MUST stay statically prerendered (TP1): no dynamic data, no `searchParams` read, matching
 * `/work`'s discipline (`app/work/page.tsx`).
 */
export default function AboutPage() {
  const resume = resumeAction();

  return (
    <>
      <AboutHero />
      <ProductJourney />
      <CapabilityClusters />
      <Impact />
      {/* TKT-41: ExperienceTimeline renders its own `<section id="experience">` (the `/work`
          ExperienceStrip and Ask evidence deep-link to `/about#experience` and, per role,
          `/about#experience-{id}`). It is a client component whose section HTML still prerenders. */}
      <ExperienceTimeline />
      <Awards />
      <Research />
      <Education />

      <Section id="about-cta" aria-labelledby="about-cta-heading">
        <h2 id="about-cta-heading" className="text-[length:var(--text-h3)] font-extrabold text-navy">
          Let&apos;s build what&apos;s next.
        </h2>
        <div className="mt-[var(--space-6)] flex flex-wrap items-center gap-[var(--space-4)]">
          <ClayButton variant="primary" href="/contact">
            Let&apos;s talk
          </ClayButton>
          <ClayButton variant="secondary" href={resume.href} download={resume.download} title={resume.note}>
            {resume.label}
          </ClayButton>
        </div>
        <p className="mt-[var(--space-9)] text-caption text-ink-soft">Designed and built with Claude Code.</p>
      </Section>
    </>
  );
}
