import type { Metadata } from "next";
import { Hero } from "@/components/hero/Hero";
import { AskPortfolio } from "@/components/ai/AskPortfolio";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { knowledge } from "@/data/knowledge";
import { teachspark } from "@/data/projects";
import { buildMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

// The 5 home-surface prompts, resolved server-side and passed to the client leaf as a plain
// string[] (A1: pages hand a leaf the exact props it needs, never the knowledge module).
const HOME_PROMPTS = knowledge.filter((entry) => entry.surface.includes("home")).map((entry) => entry.prompt);

export const metadata: Metadata = buildMetadata({
  title: `${site.name} · ${site.title}`,
  description: site.tagline,
  path: "/",
  ogFamily: `${site.name} — ${site.title}`,
});

export default function Home() {
  return (
    <>
      <Hero />

      {/*
        Ask my portfolio (home inline surface, TKT-10). The AskProvider is now hoisted to
        app/layout.tsx (TKT-11) so the inline surface and the global slide-over AskPanel share one
        provider/context; this section just renders the inline AskPortfolio within that context.
      */}
      <Section id="ask" aria-labelledby="ask-heading">
        <SectionHeading
          id="ask-heading"
          eyebrow="Ask"
          title="Ask my portfolio"
          lead="Type a question and get a sourced answer drawn only from this site — no live AI."
          className="mx-auto mb-[var(--space-8)] items-center text-center"
        />
        <AskPortfolio prompts={HOME_PROMPTS} />
      </Section>

      {/*
        FeaturedWork (tracer): a single real `ProjectCard` (TeachSpark) so the home → case-study
        path runs end-to-end. The full three-card grid + real content for all cards lands in TKT-12;
        the lone card is width-capped so it reads as intentional until then.
      */}
      <Container as="section" className="pb-24" aria-labelledby="featured-work-heading">
        <h2 id="featured-work-heading" className="sr-only">
          Featured work
        </h2>
        <div className="max-w-[26rem]">
          <ProjectCard project={teachspark} mode="featured" />
        </div>
      </Container>
    </>
  );
}
