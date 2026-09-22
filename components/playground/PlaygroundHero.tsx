import { Container } from "@/components/layout/Container";

/**
 * `/playground` page intro (TKT-44, Design.md §3 "Playground → PlaygroundHero"): flat, h1 only —
 * same convention as `WorkHero`/`ThinkingHero` (text-leading pages open flat, no clay). Headline
 * is SITEMAP.md's page name / Design.md §3's verbatim copy: "Small experiments. Big questions."
 * No sourced lead line exists for this page (same situation `ThinkingHero` documented), so the
 * hero stays h1-only rather than inventing one.
 */
export function PlaygroundHero() {
  return (
    <Container
      as="section"
      className="pt-[var(--space-12)] pb-[var(--space-8)] md:pt-[var(--space-13)]"
    >
      <h1 className="max-w-[44ch] text-[length:var(--text-h2)] font-extrabold tracking-[var(--tracking-hero)] text-ink">
        Small experiments. Big questions.
      </h1>
    </Container>
  );
}
