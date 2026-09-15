import { Hero } from "@/components/hero/Hero";
import { Container } from "@/components/layout/Container";

export default function Home() {
  return (
    <>
      <Hero />

      {/*
        FeaturedWork placeholder — the tracer renders a single card here, built from `ProjectCard`
        (TSK-06) and fed real data in TKT-12. Until TSK-06 merges this stays a clearly-marked
        placeholder so the home page composes end-to-end.
      */}
      <Container as="section" className="pb-24" aria-label="Featured work (placeholder)">
        <div className="rounded-[var(--radius-clay)] border border-dashed border-ink/15 p-8 text-[length:var(--text-lead)] text-ink-3">
          Featured work — coming in this build
        </div>
      </Container>
    </>
  );
}
