import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Hand, TornEdge } from "@/components/paper";
import { resumeAction } from "@/lib/site";

/**
 * AboutCta (TKT-87, Design.md §7.4) — `section#about-cta` on `paper`, one torn edge (§3.3: 1).
 * h2 "Let's build what's next.", primary "Let's talk" → `/contact`, secondary résumé control from
 * `resumeAction()` (PB5 — never hard-coded; today the placeholder → `/contact#resume`, the EVAL-002
 * path from `/about`), and the colophon in decision TP10's exact wording (Inter 13). The band
 * footer follows via the layout. Server component.
 */
export function AboutCta() {
  const resume = resumeAction();
  return (
    <section id="about-cta" aria-labelledby="about-cta-heading" className="acta-s">
      <TornEdge fill="paper" />
      <div className="acta-body">
        <Container className="acta-wrap">
          <h2 id="about-cta-heading">Let&apos;s build what&apos;s next.</h2>
          <div className="acta-row">
            <Link href="/contact" className="hero-btn hero-btn-primary focus-ring">
              <Hand kind="cta">Let&apos;s talk</Hand>
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href={resume.href}
              download={resume.download || undefined}
              title={resume.note}
              className="hero-btn hero-btn-secondary focus-ring"
            >
              {resume.label}
            </Link>
          </div>
          <p className="acta-colophon">Designed and built with Claude Code.</p>
        </Container>
      </div>
    </section>
  );
}
