import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { ClayButton } from "@/components/clay/ClayButton";
import { ExternalLink } from "@/components/common/ExternalLink";
import { site, resumeAction } from "@/lib/site";
import type { NavItem } from "@/lib/nav";

/**
 * Footer-only nav order (Design.md §3 Footer: "Work · Thinking · About · Contact") — deliberately
 * NOT `lib/nav.ts`'s `navItems`: the header list is `Home · Work · Thinking · About` and E-9
 * reserves Contact for footer/CTAs only, never the header nav.
 */
const footerNav: NavItem[] = [
  { label: "Work", href: "/work" },
  { label: "Thinking", href: "/thinking" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

/**
 * Two-tier site footer (technical-plan.md §B S05.04, Design.md §3 Footer). Server component — no
 * interactivity here. Tier 1 repeats the "let's talk" CTA row (resume / LinkedIn / Let's Talk) so
 * the resume is always reachable within one hop from any page (Design.md §3 conversion-goal
 * Fitts's-Law rule). Tier 2 is the caption-size site map + credit line.
 *
 * CRITICAL (decision TP10 / E-1 — see docs/reports/TKT-05.md): the tier-2 credit line is exactly
 * "Built with curiosity." — NEVER "Built with Claude Code". That authorship line is a separate
 * colophon on `/about` (M-006, TKT-40/42); technical-plan.md's own §B S05.04 prose predates the
 * TP10/E-1 correction and is stale on this one point.
 */
export function Footer() {
  const resume = resumeAction();

  return (
    <footer
      // Flat, untinted (Design.md §3: "Flat, two-tier") — deliberately no `bg-surface`/tone wash:
      // `ink-3`/`text-accent` only clear WCAG AA 4.5:1 against `--color-bg`'s lighter L (0.985);
      // surface (L 0.966) drops both to ~4.4 (axe `color-contrast`, caught by tracer's @EVAL-006).
      className="border-t border-ink/10 bg-bg pt-[var(--space-12)]"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 40px)" }}
    >
      <Container className="flex flex-col gap-[var(--space-9)]">
        {/* Tier 1 — headline + the three actions. */}
        <div className="flex flex-col gap-[var(--space-6)]">
          <h2 className="max-w-[20ch] text-[length:var(--text-h3)] font-extrabold text-ink">
            Still curious? Let&apos;s build what&apos;s next.
          </h2>
          <div className="flex flex-wrap items-center gap-[var(--space-4)]">
            <ClayButton variant="secondary" href={resume.href} download={resume.download} title={resume.note}>
              {resume.label}
            </ClayButton>
            <ClayButton variant="secondary" href={site.linkedin} external>
              LinkedIn
            </ClayButton>
            <ClayButton variant="primary" href="/contact">
              Let&apos;s Talk
            </ClayButton>
          </div>
        </div>

        {/* Tier 2 — caption-size site map + credit. */}
        <div className="flex flex-col gap-[var(--space-5)] border-t border-ink/10 pt-[var(--space-6)] text-[length:var(--text-caption)] text-ink-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="font-semibold text-ink-2">{site.name}</p>
            <p>{site.title}</p>
          </div>

          <nav aria-label="Footer" className="flex flex-wrap">
            {footerNav.map((item) => (
              <Link key={item.href} href={item.href} className="flex min-h-11 items-center px-4 focus-ring">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-wrap items-center gap-x-[var(--space-5)] gap-y-[var(--space-2)]">
            <ExternalLink href={site.github}>GitHub</ExternalLink>
            <ExternalLink href={site.priorSite}>Previous portfolio</ExternalLink>
          </div>
        </div>

        {/* Footer credit — exactly "Built with curiosity." (decision TP10/E-1). */}
        <p className="text-[length:var(--text-caption)] text-ink-3">Built with curiosity.</p>
      </Container>
    </footer>
  );
}
