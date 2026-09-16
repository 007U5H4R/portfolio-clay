import type { Metadata } from "next";
import { Hero } from "@/components/hero/Hero";
import { Container } from "@/components/layout/Container";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { teachspark } from "@/data/projects";
import { buildMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

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
