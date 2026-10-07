import type { Metadata } from "next";
import { AboutCta } from "@/components/about/AboutCta";
import { AboutHero } from "@/components/about/AboutHero";
import { CareerContexts } from "@/components/about/CareerContexts";
import { Recognition } from "@/components/about/Recognition";
import { ResearchValues } from "@/components/about/ResearchValues";
import { Testimonials } from "@/components/about/Testimonials";
import { ThreeChapters } from "@/components/about/ThreeChapters";
import { SceneOpener } from "@/components/paper/SceneOpener";
import { buildMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: `About · ${site.name}`,
  description:
    "Who Tushar is — a builder who connects deep tech to real-world impact: from research labs and a granted patent to cloud platforms and AI-native products.",
  path: "/about",
  ogFamily: "About Tushar Pathak",
});

/**
 * `/about` — WHO Tushar is (TASK-136, Tushar's About redesign spec 2026-09-29,
 * `docs/redesign-mockups/m-009/tushar-2026-09-29/about-redesign-spec.md`; Design.md §7.4). Five areas,
 * about four to five viewports, readable in a minute:
 *
 *   scene opener (TASK-114, every tab) → hero → Three Chapters → Career Across Contexts →
 *   Research + What Drives Me → Recognition → In their words (three LinkedIn recommendations) →
 *   the dark Experience / Certifications strip → band.
 *
 * WHAT he did — employer-by-employer roles, dates, bullets, scope and self-reported outcomes, skills,
 * education — lives on `/work` (Experience); the badges on `/certifications`. About only references them.
 *
 * Route MUST stay statically prerendered (TP1): no dynamic data, no `searchParams` read.
 */
export default function AboutPage() {
  return (
    <>
      <SceneOpener id="scene-about" priority />
      <AboutHero />
      <ThreeChapters />
      <CareerContexts />
      <ResearchValues />
      <Recognition />
      <Testimonials />
      <AboutCta />
    </>
  );
}
