import { Quote } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Illustration } from "@/components/paper";
import { ClayCard } from "@/components/clay/ClayCard";
import { Icon } from "@/components/common/Icon";
import { experience } from "@/data/experience";

/**
 * `/about`'s editorial opening (M-008 Stage B, redesign to `docs/redesign-mockups/
 * mockups-8panel-2026-09-23.png` panel 4 "About — New Opening, Editorial"). Replaces the earlier
 * flat-hero-variant bio (TSK-23/TKT-40, "headline + avatar, no floating tiles") with a statement
 * headline + 3-stat row + pull-quote, per the brief: "an editorial opening (NOT a résumé)".
 *
 * TSK-38: the M-008 avatar scene (same asset, corner tiles, cursor-parallax hero treatment) is
 * deleted with the rest of the hero motion system. The illustration column now renders a temporary
 * `Illustration id="scene-about" placement="photo"` stand-in (paper primitives, no motion) until
 * TKT-86 rebuilds this page with the §6.4 scene-bleed treatment; only the CONTENT column below is
 * restyled by this ticket's own scope.
 *
 * Content truth:
 *   - Headline ("I started with machines. Then systems. Then people. Now, intelligent products.")
 *     and subline ("Same curiosity → bigger problems.") are new editorial framing written for this
 *     redesign — not present in any `data/*.ts` fact — so both are DRAFT, unsigned-off copy
 *     (same convention `data/hero.ts`'s own DRAFT rows and `HowIThink`'s principle text use: no
 *     invented fact, but the phrasing itself awaits Tushar's sign-off). No banned title/credential
 *     phrasing is used (A3 rule 5).
 *   - The pull-quote ("I build at the intersection of people, products and intelligent systems.")
 *     does not appear anywhere in `data/*.ts` or existing site copy (checked); per the task brief
 *     it is used anyway and flagged DRAFT here, exactly like the headline above.
 *   - The 3-stat row is derived, not invented:
 *       · "10+ years" — `experience[]`'s earliest role start (Godrej Infotech, 2016-09,
 *         `data/experience.ts`) through the `data/impact.ts` `RESUME_ASOF` snapshot year (2026);
 *         "+" because the AmEx role that closes the span is still open-ended ("present").
 *       · "3 industries — physical → cloud → AI" — the same 4-stage career arc `ProductJourney`
 *         renders (`components/timeline/ProductJourney.tsx` STAGES: physical/enterprise → cloud &
 *         data → AI-enabled → AI-native), collapsed to 3 buckets by folding the two AI-labelled
 *         stages into one "AI" bucket for this shorter stat read. Not a new fact — a re-grouping
 *         of the same sourced stages.
 *       · "∞ curiosity" — not a metric; "curiosity" is the same VERIFIED framing word the previous
 *         bio paragraph used ("Driven by curiosity, systems thinking…", CONTENT_INVENTORY §4.1),
 *         reused rather than re-invented.
 *
 * Server component: no interactivity/motion remains in this file, so there is nothing to gate
 * behind `useReducedMotionSafe`/`usePointerFine`.
 */

// Earliest experience start year (data/experience.ts) — never hard-coded past this derivation.
const EARLIEST_START_YEAR = Math.min(...experience.map((role) => Number(role.dates.start.slice(0, 4))));
// Matches data/impact.ts's RESUME_ASOF snapshot year (résumé snapshot, 2026-09-15) — the same
// anchor year the rest of /about's numbers are dated to, so this stat never drifts from Impact's.
const RESUME_ASOF_YEAR = 2026;
const YEARS_BUILDING = RESUME_ASOF_YEAR - EARLIEST_START_YEAR;

const STATS = [
  { value: `${YEARS_BUILDING}+`, label: "years building products" },
  { value: "3", label: "industries — physical → cloud → AI" },
  { value: "∞", label: "curiosity" },
] as const;

export function AboutHero() {
  return (
    <Container
      as="section"
      aria-labelledby="about-hero-heading"
      className="flex flex-col items-center gap-8 pt-8 pb-16 text-left lg:grid lg:grid-cols-[42fr_58fr] lg:items-center lg:gap-16 lg:pt-32 lg:pb-20 2xl:gap-24"
    >
      <div className="flex w-full justify-center lg:justify-start">
        {/* Temporary stand-in (TSK-38) — TKT-86 rebuilds this page with the §6.4 scene-bleed
            treatment; `photo` placement keeps a single-image, alt-from-manifest illustration in
            the same column slot the deleted M-008 avatar scene occupied. */}
        <Illustration id="scene-about" placement="photo" sizes="(min-width: 1024px) 42vw, 100vw" />
      </div>

      <div className="flex min-w-0 flex-col items-start gap-6 text-left md:gap-7">
        <span className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-ivory px-4 py-2 text-[length:var(--text-caption)] font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-navy-2 shadow-[var(--shadow-utility)]">
          <span aria-hidden="true" className="inline-block h-2 w-2 rounded-full bg-rust" />
          About
        </span>

        <h1
          id="about-hero-heading"
          className="text-[length:var(--text-hero)] font-extrabold tracking-[var(--tracking-hero)] leading-[var(--leading-hero)] text-navy lg:text-[length:var(--text-hero-lg)]"
        >
          <span className="block">I started with machines.</span>
          <span className="block">Then systems. Then people.</span>
          <span className="hero-highlight block w-fit">Now, intelligent products.</span>
        </h1>

        {/* DRAFT subline — see docstring. Hand annotation styling matches the home Hero's own
            `Annotation` arrow-copy treatment (`--font-hand`), but this line carries real content
            (not decorative), so it stays in the accessibility tree — no `aria-hidden`. */}
        <p style={{ fontFamily: "var(--font-hand)" }} className="text-[1.5rem] leading-none text-ink-soft">
          Same curiosity <span aria-hidden="true">→</span> bigger problems.
        </p>

        {/* Plain value/label pairs — same convention as `MetricCard`'s body (`<p>`s, no `dl`), not
            a citation-bearing metric so it does not reuse `MetricCard` itself (see docstring). */}
        <div className="grid w-full grid-cols-3 gap-4 border-y border-navy/10 py-5 sm:gap-6">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1">
              <p className="text-[length:var(--text-h3)] font-extrabold text-navy">{stat.value}</p>
              <p className="text-caption leading-snug text-ink-soft">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Pull-quote — DRAFT, see docstring. `tier="card"` gives it the same clay-card language
            the former flagship product scene's pull-quote used (mockup 2, removed at TSK-38)
            rather than a plain blockquote. */}
        <ClayCard tier="card" tone="lavender" padding="card" className="flex w-full max-w-[440px] flex-col gap-3">
          <Icon icon={Quote} size={24} className="text-rust" />
          <blockquote className="text-[length:var(--text-lead)] font-semibold text-navy">
            I build at the intersection of people, products and intelligent systems.
          </blockquote>
        </ClayCard>
      </div>
    </Container>
  );
}
