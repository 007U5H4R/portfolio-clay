import type { Metadata } from "next";
import { Hero } from "@/components/hero/Hero";
import { HeroActivationProvider } from "@/components/hero/HeroActivationContext";
import { AskPortfolio } from "@/components/ai/AskPortfolio";
import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { FeaturedWork } from "@/components/projects/FeaturedWork";
import { HowIThink, type HowIThinkStage } from "@/components/home/HowIThink";
import { FinalCTA } from "@/components/home/FinalCTA";
import { knowledge } from "@/data/knowledge";
import { getProject } from "@/data/projects";
import { thinkingFramework } from "@/data/thinking-framework";
import { orderStages } from "@/lib/stages";
import { buildMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

// The 5 home-surface prompts, resolved server-side and passed to the client leaf as a plain
// string[] (A1: pages hand a leaf the exact props it needs, never the knowledge module).
const HOME_PROMPTS = knowledge.filter((entry) => entry.surface.includes("home")).map((entry) => entry.prompt);

// How-I-Think stages (TKT-13), resolved server-side into the exact client-leaf shape (A1: the
// client component never imports data/schema.ts or data/projects.ts directly) — each stage's
// `example.project` slug is resolved to its sourced display name here (e.g. "Nuptis → Velora").
const HOW_I_THINK_STAGES: HowIThinkStage[] = orderStages(thinkingFramework).map((stage) => ({
  id: stage.id,
  label: stage.label,
  principle: stage.principle,
  tone: stage.tone,
  example: {
    quote: stage.example.quote,
    attribution: stage.example.attribution,
    href: stage.example.href,
    projectName: getProject(stage.example.project)?.name ?? stage.example.project,
  },
}));

export const metadata: Metadata = buildMetadata({
  title: `${site.name} · ${site.title}`,
  description: site.tagline,
  path: "/",
  ogFamily: `${site.name} — ${site.title}`,
});

export default function Home() {
  return (
    // HeroActivationProvider lifts one boolean ("is the Ask input focused?") to a common ancestor of
    // both the Hero and the Ask section so focusing the input can subtly activate the hero avatar
    // scene (animation prompt.md §5). Client provider; the server sections pass through as children.
    <HeroActivationProvider>
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
        FeaturedWork (TKT-12): the three-card editorial row (TeachSpark large + RailCite/Velora
        medium), replacing the M-001 tracer's single width-capped card. Full case-study content per
        card lands in M-005.
      */}
      <FeaturedWork />

      {/*
        HowIThink (TKT-13): the six-stage process module, one real sourced example per stage.
        Additive only — Hero/Ask/FeaturedWork above are unchanged.
      */}
      <HowIThink stages={HOW_I_THINK_STAGES} />

      {/*
        FinalCTA (TKT-14): the closing call-to-action — the last section in the fixed home order
        (Hero → Ask → Featured work → How I think → Final CTA, Design.md §3 line 162). Carries the
        section's single lavender accent (the hero-tier card) and the three conversion actions.
      */}
      <FinalCTA />
    </HeroActivationProvider>
  );
}
