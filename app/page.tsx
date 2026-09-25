import type { Metadata } from "next";
import { Hero } from "@/components/hero/Hero";
import { AskSection } from "@/components/ai/AskSection";
import { FeaturedWork } from "@/components/projects/FeaturedWork";
import { HowIThink, type HowIThinkStage } from "@/components/home/HowIThink";
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
    <>
      {/* Order per Design.md §7.1 (M-009, TKT-74 S74.01): hero → Featured → How I think → Ask → band. */}
      <Hero />

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
        Ask my portfolio (TKT-77, Design.md §7.1): section#ask on paper-2 with a torn edge and the
        notebook AskPortfolio. The AskProvider is hoisted to app/layout.tsx (TKT-11) so the inline
        surface and the global AskPanel share one provider/context.
      */}
      <AskSection prompts={HOME_PROMPTS} />

      {/* No closing CTA section here (S16, TKT-72): the band footer in app/layout.tsx is the one
          closing call-to-action on every route. */}
    </>
  );
}
