import Link from "next/link";
import { FileText, ShieldCheck, type LucideIcon } from "lucide-react";
import type { Metric, Project } from "@/data/schema";
import { projects } from "@/data/projects";
import { portfolioEntries } from "@/data/portfolio";
import { featuredPresentation, type FeaturedPresentation } from "@/data/featured";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/interactions/Reveal";
import { Sheet, Tape, TornEdge, type TapeSide } from "@/components/paper";
import { illustration } from "@/lib/illustrations";
import { productHref } from "@/lib/portfolio";
import { formatAsOf } from "@/lib/format";

/**
 * The featured trio, rank 1/2/3 (`data/projects.ts` `featured`; the content gate guarantees exactly
 * three with distinct ranks). Rank 1 is the large anchor (TASK-133: RailCite · Slag City · Campfire Board).
 */
export const FEATURED: Project[] = projects
  .filter((project) => project.featured)
  .sort((a, b) => (a.featured ?? 0) - (b.featured ?? 0));

/** Per-card paper placement (spec §10: RailCite −0.2…−0.4°, Slag City +0.2…+0.5°, Campfire −0.2…+0.2°). */
const PLACEMENT: readonly { rotate: number; tape: TapeSide }[] = [
  { rotate: -0.3, tape: "l" },
  { rotate: 0.35, tape: "c" },
  { rotate: -0.15, tape: "r" },
];

/** The icon beside a proof point, by metric kind (a document for a measured count, a shield for a structural guarantee). */
const METRIC_ICON: Record<Metric["kind"], LucideIcon> = { measured: FileText, structural: ShieldCheck, "self-reported": FileText };

/**
 * How a proof point states its kind (the site's metric-kind convention — MetricStrip / ProjectCard:
 * kind named in text, `as of` date for a measured value). "0 invented citations" is enforced by the
 * code, not measured, so it reads "Structural · by construction" (its record context), never a date.
 */
export function metricKindNote(metric: Metric): string {
  if (metric.kind === "structural") return "Structural · by construction";
  if (metric.kind === "self-reported") return `Self-reported · ${formatAsOf(metric.asOf)}`;
  return `Measured · ${formatAsOf(metric.asOf)}`;
}

export interface FeaturedCard {
  project: Project;
  presentation: FeaturedPresentation;
  /** The verified short cover line (`data/portfolio.ts` `coverLine`), shown with a closing period. */
  tagline: string;
  metrics: Metric[];
  href: string;
  ctaLabel: string;
}

/**
 * Resolve each featured record to its card: presentation from `data/featured.ts`, cover line from
 * `data/portfolio.ts`, metric rows looked up by label in `project.metrics`. Anything missing throws —
 * a gap fails the build rather than rendering an empty or invented row.
 */
export function featuredCards(featured: readonly Project[] = FEATURED): FeaturedCard[] {
  return featured.map((project) => {
    const presentation = featuredPresentation[project.slug];
    if (!presentation) throw new Error(`FeaturedWork: ${project.slug} has no data/featured.ts entry`);
    const entry = portfolioEntries.find((e) => e.slug === project.slug);
    if (!entry) throw new Error(`FeaturedWork: ${project.slug} has no data/portfolio.ts entry`);
    const metrics = presentation.metrics.map((label) => {
      const metric = project.metrics.find((m) => m.label === label);
      if (!metric) throw new Error(`FeaturedWork: ${project.slug} has no metric labelled "${label}"`);
      return metric;
    });
    return {
      project,
      presentation,
      tagline: `${entry.coverLine}.`,
      metrics,
      href: productHref(project.slug),
      ctaLabel: `Explore ${project.name} in Portfolio`,
    };
  });
}

/** The terracotta torn-paper Explore button (spec §15) — a real same-tab link to the Portfolio deep link. */
function ExploreLink({ card }: { card: FeaturedCard }) {
  return (
    <Link href={card.href} aria-label={card.ctaLabel} className="fw-cta focus-ring" data-featured-cta={card.project.slug}>
      <span className="fw-cta-text">{card.presentation.cta}</span>
      <svg className="fw-cta-arrow" viewBox="0 0 20 12" width="20" height="12" aria-hidden="true" focusable="false">
        <path d="M1 6h16M12 1.5 17 6l-5 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
}

function FeaturedArt({ card }: { card: FeaturedCard }) {
  const art = illustration(card.presentation.art);
  return (
    <div className="fw-art">
      {/* eslint-disable-next-line @next/next/no-img-element -- a static SVG collage (no raster pipeline to gain) */}
      <img
        src={art.publicSrc}
        width={art.width}
        height={art.height}
        alt={art.alt}
        loading="lazy"
        decoding="async"
        data-illustration={art.id}
      />
    </div>
  );
}

function Card({ card, index }: { card: FeaturedCard; index: number }) {
  const { project, presentation, metrics } = card;
  const anchor = index === 0;
  const place = PLACEMENT[index] ?? { rotate: 0, tape: "c" as const };
  const headingId = `fw-${project.slug}-h`;
  return (
    <Sheet as="article" variant="card" rotate={place.rotate} className={`fw-card ${anchor ? "fw-card-anchor" : "fw-card-side"}`}>
      <Tape side={place.tape} />
      <div className="fw-paper" data-featured={project.slug}>
        <div className="fw-copy">
          {anchor ? <p className="fw-kicker">{project.tags.join(" · ")}</p> : null}
          <h3 id={headingId} className="fw-name">
            {project.name}
          </h3>
          <p className="fw-tagline">{card.tagline}</p>
          {presentation.line ? <p className="fw-line">{presentation.line}</p> : null}
          {metrics.length > 0 ? (
            <ul className="fw-proof" aria-label={`${project.name} proof points`}>
              {metrics.map((metric) => {
                const Icon = METRIC_ICON[metric.kind];
                return (
                  <li key={metric.label} className="fw-proof-item" data-metric={metric.kind}>
                    <Icon className="fw-proof-icon" aria-hidden="true" strokeWidth={1.6} />
                    <b className="fw-proof-value" data-metric-value="">
                      {metric.value}
                    </b>{" "}
                    <span className="fw-proof-body">
                      <span className="fw-proof-label" data-metric-label="">
                        {metric.label}
                      </span>
                      <span className="fw-proof-kind" data-metric-kind="">
                        {metricKindNote(metric)}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : null}
          <ExploreLink card={card} />
        </div>
        <FeaturedArt card={card} />
      </div>
    </Sheet>
  );
}

/**
 * Home Featured Work (TASK-133, Tushar's spec 2026-09-29; supersedes the TKT-75 three-card grid —
 * Design.md §7.1, §11 Dev-127). `section#work-featured` on `paper-2` under its torn edge: a compact
 * head (eyebrow · h2 · one subline, spec §2), then an asymmetric editorial spread — RailCite as the
 * large anchor (left, ~60 %), Slag City over Campfire Board (right). Each card is a torn cream sheet
 * with its own hand-authored cut-paper collage (static SVG, no JS) and ONE real link: the terracotta
 * Explore button → `/projects?product=<slug>` (the Portfolio deep link, same tab — spec §12–§14, §26).
 *
 * Decorations = 1 (the torn edge — Design.md §3.3); the tapes are fasteners and the cards content
 * paper. Motion (spec §25): the existing one-shot `Reveal` (IntersectionObserver, fires once) —
 * heading and RailCite rise 10 px, the right cards slide 10 px in from the right; none under reduced
 * motion. Server component (only `Reveal` is a client leaf, already on the page for How I think).
 */
export function FeaturedWork() {
  const cards = featuredCards();
  return (
    <section id="work-featured" aria-labelledby="work-featured-heading" className="featured">
      <TornEdge fill="paper-2" />
      <div className="featured-body">
        <Container className="featured-wrap">
          <Reveal className="fw-head fw-rv-y" index={0}>
            <p className="fw-eyebrow">Featured work</p>
            <h2 id="work-featured-heading" className="fw-h2">
              Real problems. Real products.
            </h2>
            <p className="fw-sub">Three products that show how I turn ambiguity into something people can actually use.</p>
          </Reveal>
          <div className="fw-grid">
            {cards.map((card, index) => (
              <Reveal
                key={card.project.slug}
                index={index + 1}
                className={`fw-slot ${index === 0 ? "fw-slot-anchor fw-rv-y" : "fw-slot-side fw-rv-x"}`}
              >
                <Card card={card} index={index} />
              </Reveal>
            ))}
          </div>
        </Container>
      </div>
    </section>
  );
}
