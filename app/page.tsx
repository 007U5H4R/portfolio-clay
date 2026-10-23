import type { Metadata } from "next";
import "./styles/home__work-slug.css";
import "./styles/home.css";
import "./styles/home__projects.css";
import "./styles/home__projects__work-slug.css";
import "./styles/about__home.css";
import "./styles/origami-bloom-cover.css";
import { Hero } from "@/components/hero/Hero";
import { HomeAskTushky } from "@/components/ai/HomeAskTushky";
import { OrigamiBloomGate } from "@/components/intro/OrigamiBloomGate";
import { AwardsSection, CredentialsSection, SelectedWorkSection } from "@/components/home/HomeSections";
import { buildMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: `${site.name} · ${site.title}`,
  description: site.tagline,
  path: "/",
});

export default function Home() {
  return (
    <>
      {/* Order (TASK-211): hero → Credentials → Selected work → Awards → Ask → band. The two sections these
          replaced (Featured Work, How I think) are gone from Home; Hero and Ask are unchanged. */}
      {/* The Origami Bloom (TASK-360): phone-only welcome splash; renders nothing unless the head script chose it. */}
      <OrigamiBloomGate />
      <Hero />
      <CredentialsSection />
      <SelectedWorkSection />
      <AwardsSection />

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
