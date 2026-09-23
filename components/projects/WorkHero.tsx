import { Container } from "@/components/layout/Container";

/**
 * `/work` page intro (TKT-16, Design.md §3 "Work page → WorkHero"; light M-008 Stage B / TASK-57
 * touch to `docs/redesign-mockups/mockups-8panel-2026-09-23.png` panel 6, whose opening reads
 * "WORK" eyebrow → statement headline → subline). Stays a flat, no-clay zone — text-leading pages
 * open flat, establishing credibility before any clay appears below the fold (unchanged decision);
 * only an eyebrow label was added, reusing `AboutHero`'s own eyebrow-chip idiom verbatim (utility
 * shadow only, no clay gradient, so the "no clay above the fold" contract holds). The h1 ("Work")
 * and lead line are UNCHANGED, verbatim CONTENT_INVENTORY §2.1 copy (DRAFT) — the panel's own
 * "Products I've bet on." headline is mockup illustrative copy, not sourced content, so it is not
 * reproduced here (no new fact/phrasing invented), and the existing h1 text is load-bearing for
 * `tests/e2e/work.spec.ts`'s exact-text assertion.
 */
export function WorkHero() {
  return (
    <Container
      as="section"
      className="pt-[var(--space-12)] pb-[var(--space-8)] md:pt-[var(--space-13)]"
    >
      <div className="flex max-w-[44ch] flex-col gap-[var(--space-3)]">
        <span className="inline-flex w-fit items-center gap-[var(--space-2)] rounded-[var(--radius-pill)] bg-surface px-[var(--space-4)] py-[var(--space-2)] text-[length:var(--text-caption)] font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-ink-2 shadow-[var(--shadow-utility)]">
          <span aria-hidden="true" className="inline-block h-2 w-2 rounded-full bg-accent" />
          Work
        </span>
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
