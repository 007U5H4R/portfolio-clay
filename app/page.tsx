import type { Metadata } from "next";
import { Hero } from "@/components/hero/Hero";
import { HomeAskTushky } from "@/components/ai/HomeAskTushky";
import { FeaturedWork } from "@/components/projects/FeaturedWork";
import { HowIThink, type HowIThinkStage } from "@/components/home/HowIThink";
import { getProject } from "@/data/projects";
import { thinkingFramework } from "@/data/thinking-framework";
import { orderStages } from "@/lib/stages";
import { buildMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

// How-I-Think stages (TKT-13), resolved server-side into the exact client-leaf shape (A1: the
// client component never imports data/schema.ts or data/projects.ts directly) — each stage's
// `example.project` slug is resolved to its sourced display name here (e.g. "Nuptis → Velora").
const HOW_I_THINK_STAGES: HowIThinkStage[] = orderStages(thinkingFramework).map((stage) => ({
  id: stage.id,
  label: stage.label,
  principle: stage.principle,
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
        FeaturedWork (TASK-133, Design.md §7.1, Dev-127): section#work-featured on paper-2 — the
        three-product showcase (RailCite anchor · Slag City · Campfire Board), each Explore → /projects?product=<id>.
      */}
      <FeaturedWork />

      {/*
        HowIThink (TKT-13): the six-stage process module, one real sourced example per stage.
        Additive only — Hero/Ask/FeaturedWork above are unchanged.
      */}
      <HowIThink stages={HOW_I_THINK_STAGES} />

      {/*
        Ask Tushky (TKT-113, Design.md §7.1, §11 Dev-64–69): section#ask on paper-2 with a torn edge —
        the launcher for the right-side Ask Tushky drawer. It never answers inline; typed text or a
        suggestion opens the drawer and is asked there. The AskProvider is hoisted to app/layout.tsx.
      */}
      <HomeAskTushky />

      {/* No closing CTA section here (S16, TKT-72): the band footer in app/layout.tsx is the one
          closing call-to-action on every route. */}
    </>
  );
}
