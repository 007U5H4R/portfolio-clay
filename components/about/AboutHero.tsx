import { Container } from "@/components/layout/Container";
import { Prose } from "@/components/common/Prose";
import { AvatarStage } from "@/components/hero/AvatarStage";
import { site } from "@/lib/site";

/**
 * `/about`'s flat hero variant of the home `Hero` (Design.md §3 Timeline section: "AboutHero is a
 * flat hero variant of Hero — headline + avatar, no floating tiles"; TSK-23, TKT-40, TC-095).
 *
 * Differs from `components/hero/Hero.tsx` by omission, not by a new visual language:
 *   - no `FloatingTiles` — the home hero's 3-tile proof stack; About doesn't restate hero proof,
 *     `ProductJourney` right below carries that instead.
 *   - no `Annotation` and no CTA row — "View My Work" / "Download Resume" already live in the
 *     header/footer/Contact; About's job here is the bio, not a repeated conversion ask.
 *   - the eyebrow + headline + support three-liner collapses into a single `Prose` bio paragraph
 *     capped at ≤600px (narrower than `Prose`'s own 60ch default, per the brief) — About reads as
 *     a flat text page (Design.md §2), not a second hero pitch.
 * Reuses the SAME `AvatarStage` (same avatar asset, same corner `ClayIcon` tiles, same cursor
 * parallax / reduced-motion behaviour) the home `Hero` uses — one avatar treatment everywhere it
 * appears (Law of Similarity), rather than a second bespoke avatar implementation.
 *
 * Headline composed from `site.title` + `site.tagline` (single source of truth, `lib/site.ts`)
 * rather than a hard-coded string, so it can never drift from the header/footer's own copy.
 *
 * Bio (CONTENT_INVENTORY §4.1, DRAFT pending Tushar's sign-off — flagged in docs/reports/TSK-23.md):
 * composed from the "PORT About" fragment (curiosity/systems-thinking/customer-problems +
 * questioning-assumptions/uncovering-insights, with the banned job-title phrasing (A3 rule 5 /
 * `scripts/forbidden-strings.ts`) deliberately omitted per the brief) and the résumé profile-
 * summary fragment ("7+ years… cloud-native, AI, and data-driven products across GCP and AWS"). No
 * fact beyond those two sourced fragments is invented.
 *
 * Server component: the only interactivity (cursor parallax) is isolated inside `AvatarStage`,
 * same as `Hero`.
 */
export function AboutHero() {
  return (
    <Container
      as="section"
      aria-labelledby="about-hero-heading"
      className="flex flex-col items-center gap-8 pt-8 pb-16 text-left lg:grid lg:grid-cols-[42fr_58fr] lg:items-center lg:gap-16 lg:pt-32 lg:pb-20 2xl:gap-24"
    >
      <div className="flex w-full justify-center lg:justify-start">
        <AvatarStage />
      </div>

      <div className="flex min-w-0 flex-col items-start gap-5 text-left md:gap-6">
        <h1
          id="about-hero-heading"
          className="text-[length:var(--text-hero)] font-extrabold tracking-[var(--tracking-hero)] leading-[var(--leading-hero)] text-ink lg:text-[length:var(--text-hero-lg)]"
        >
          {site.title}. {site.tagline}.
        </h1>

        <Prose className="!max-w-[600px]">
          <p>
            Driven by curiosity, systems thinking, and a bias toward building products that solve
            real customer problems, I enjoy questioning assumptions and uncovering insights hidden
            in everyday experiences. I bring 7+ years building cloud-native, AI, and data-driven
            products across GCP and AWS.
          </p>
        </Prose>
      </div>
    </Container>
  );
}
