import { Container } from "@/components/layout/Container";
import { Annotation, DraftTag, Hand, Pin, Sheet, Tape } from "@/components/paper";
import { experience } from "@/data/experience";

/**
 * `/about` hero (TKT-86 S86.01, Design.md §7.4 "Hero", §3.3 `/about` hero = 2). Server component.
 *
 * The scene itself is NOT here: TKT-95 (EXE-18, Design §11 Dev-24) renders `scene-about` once as the
 * page's full-bleed `SceneOpener` directly above this section, superseding §7.4's "copy in the sky"
 * bleed and its < 900 "copy above a 4:3 masked photo" fallback. This section is the copy + the
 * "hero-under" row beneath that opener: eyebrow, three-line h1 (third line rust) + `DraftTag`, the
 * hand-sub annotation, the taped stats card, the caption annotation and the pinned pull-quote.
 *
 * Decorations (§3.3): hand-sub annotation + caption annotation = 2. The stats card (`data-paper="card"`
 * + a tape fastener) and the pull-quote (`data-paper="index"` + a pin) are content paper — not counted.
 *
 * Dev-10: "Same curiosity → bigger problems." is an `aria-hidden` annotation (it used to sit in the
 * accessibility tree); the h1 carries the narrative.
 *
 * Content truth (carried over from the M-008 AboutHero; nothing new is claimed):
 *   - Headline, subline and pull-quote are DRAFT editorial framing (no `data/*.ts` fact) — rendered
 *     with a `DraftTag`. The pull-quote's source is Tushar himself (same attribution as the band
 *     tagline, Dev-20), given as an sr-only "Source:" sibling so the `data-hand="quote"` exemption
 *     (§3.4) holds.
 *   - "10+ years" = the earliest `data/experience.ts` start year (2016) to the résumé snapshot year
 *     (2026, `data/impact.ts` RESUME_ASOF); "+" because the AmEx role is still open ("present").
 *   - "3 industries" re-groups `ProductJourney`'s four stages (the two AI stages folded into one).
 *   - "∞ curiosity" is not a metric — the VERIFIED framing word from CONTENT_INVENTORY §4.1.
 */

// Earliest experience start year (data/experience.ts) — derived, never hard-coded.
const EARLIEST_START_YEAR = Math.min(...experience.map((role) => Number(role.dates.start.slice(0, 4))));
// Matches data/impact.ts's RESUME_ASOF snapshot year (2026-09-15) — the anchor year of /about's numbers.
const RESUME_ASOF_YEAR = 2026;
const YEARS_BUILDING = RESUME_ASOF_YEAR - EARLIEST_START_YEAR;
// The open-ended role that makes the span "N+" (dates.end absent = "present").
const OPEN_ROLE = experience.find((role) => role.dates.end === undefined);

export const ABOUT_STATS = [
  { value: `${YEARS_BUILDING}+`, label: "years building products" },
  { value: "3", label: "industries — physical → cloud → AI" },
  { value: "∞", label: "curiosity" },
] as const;

export const ABOUT_STATS_HOW = `counted from ${EARLIEST_START_YEAR} — the “+” is because ${
  OPEN_ROLE ? `the ${OPEN_ROLE.company} role` : "the current role"
} is still open`;

export const ABOUT_PULL_QUOTE = "I build at the intersection of people, products and intelligent systems.";

export function AboutHero() {
  return (
    <Container as="section" aria-labelledby="about-hero-heading" className="ahero">
      <div className="ahero-copy">
        <p className="ahero-eyebrow" data-micro-label="">
          About<span aria-hidden="true" className="ahero-dot">·</span>Senior Product Manager
        </p>
        <h1 id="about-hero-heading" className="ahero-h1">
          <span className="block">I started with machines.</span>
          <span className="block">Then systems. Then people.</span>
          <span className="block ahero-now">Now, intelligent products.</span>
        </h1>
        <DraftTag className="ahero-draft" />
        {/* Dev-10: decorative restatement — out of the accessibility tree; the h1 carries the narrative. */}
        <Annotation size="hero" rotate={-1.5} className="ahero-sub">
          Same curiosity → bigger problems.
        </Annotation>
      </div>

      <div className="ahero-under">
        <div className="ahero-stats-col">
          <Sheet variant="card" rotate={-0.7} className="ahero-stats">
            <Tape side="l" />
            <ul className="ahero-stat-list" aria-label="Three quick facts">
              {ABOUT_STATS.map((stat) => (
                <li key={stat.label} className="ahero-stat">
                  <b>{stat.value}</b>
                  <span>{stat.label}</span>
                </li>
              ))}
            </ul>
            <p className="ahero-how">{ABOUT_STATS_HOW}</p>
          </Sheet>
          <Annotation size="sm" className="ahero-cap">
            coffee first. then the roadmap.
          </Annotation>
        </div>

        <Sheet as="figure" variant="index" rotate={0.8} className="ahero-quote">
          <Pin />
          <Hand kind="quote" as="blockquote" cite={<span className="sr-only">Source: Tushar Pathak</span>}>
            {`“${ABOUT_PULL_QUOTE}”`}
          </Hand>
          <DraftTag className="ahero-quote-draft" />
        </Sheet>
      </div>
    </Container>
  );
}
