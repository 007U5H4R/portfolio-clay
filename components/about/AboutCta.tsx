import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { ABOUT_CTA } from "./about-content";
import { AboutArtImg } from "./AboutArtImg";

function Arrow() {
  return (
    <svg className="acx-arrow" viewBox="0 0 20 12" width="20" height="12" aria-hidden="true" focusable="false">
      <path d="M1 6h16M12 1.5 17 6l-5 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * The About → Experience CTA (TASK-136, spec §34–§35) — `section#about-cta`, the strip that closes the page:
 * a deep navy torn-paper strip (a baked tear mask, like the TASK-133 cards) with cream text "Want the full
 * story with roles, achievements and metrics?", a terracotta primary "See full experience →" (`/work`, the
 * existing Experience tab) and a cream secondary "View certifications →" (`/certifications`), and a small
 * cut-paper mountain horizon at the right end. No generic contact CTA here — the header's "Let's connect"
 * and the band footer carry that.
 *
 * EVAL-018: the horizon `collage` (`alt=""`, hidden < 640 but kept in the DOM) = 1; no torn section edge
 * (the strip's own tear is its paper).
 */
export function AboutCta() {
  return (
    <section id="about-cta" aria-labelledby="about-cta-heading" className="acx">
      <Container className="acx-wrap">
        <div className="acx-strip">
          <h2 id="about-cta-heading" className="acx-title">
            {ABOUT_CTA.title}
          </h2>
          <div className="acx-actions">
            <Link href={ABOUT_CTA.primary.href} className="acx-btn acx-btn-primary focus-ring">
              {ABOUT_CTA.primary.label}
              <Arrow />
            </Link>
            <Link href={ABOUT_CTA.secondary.href} className="acx-btn acx-btn-secondary focus-ring">
              {ABOUT_CTA.secondary.label}
              <Arrow />
            </Link>
          </div>
          <div className="acx-horizon" data-decor="collage" aria-hidden="true">
            <AboutArtImg id="mountains" className="acx-horizon-img" />
          </div>
        </div>
      </Container>
    </section>
  );
}
