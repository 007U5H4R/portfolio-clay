import { Container } from "@/components/layout/Container";

/**
 * `/thinking` page intro (TKT-43, Design.md §3 "Thinking → ThinkingHero"): flat, h1 only — no lead
 * line, no clay (text-leading pages open flat, same convention as `WorkHero`). No copy source exists
 * for a supporting line beyond the SITEMAP.md page name itself, so the hero stays h1-only rather
 * than inventing one.
 */
export function ThinkingHero() {
  return (
    <Container
      as="section"
      className="pt-[var(--space-12)] pb-[var(--space-8)] md:pt-[var(--space-13)]"
    >
      <h1 className="max-w-[44ch] text-[length:var(--text-h2)] font-extrabold tracking-[var(--tracking-hero)] text-ink">
        Thinking
      </h1>
    </Container>
  );
}
