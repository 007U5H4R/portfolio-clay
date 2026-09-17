import { Container } from "@/components/layout/Container";

/**
 * `/work` page intro (TKT-16, Design.md §3 "Work page → WorkHero"): a flat, no-clay zone with an
 * h1 + one lead line — text-leading pages open flat, establishing credibility before any clay
 * appears below the fold. Copy is CONTENT_INVENTORY §2.1 (verbatim, DRAFT): heading "Work" + the
 * framing line that tells a recruiter personal builds lead and corporate work is listed as
 * experience, never dressed up as a public product (Solution-PRD §5).
 */
export function WorkHero() {
  return (
    <Container
      as="section"
      className="pt-[var(--space-12)] pb-[var(--space-8)] md:pt-[var(--space-13)]"
    >
      <div className="flex max-w-[44ch] flex-col gap-[var(--space-3)]">
        <h1 className="text-[length:var(--text-h2)] font-extrabold tracking-[var(--tracking-hero)] text-ink">
          Work
        </h1>
        <p className="text-[length:var(--text-lead)] text-ink-2">
          Personal builds first. Corporate work is listed as experience, not product.
        </p>
      </div>
    </Container>
  );
}
