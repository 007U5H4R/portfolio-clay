import type { Project } from "@/data/schema";
import { projectIcon } from "@/data/projects";
import { ClayCard } from "@/components/clay/ClayCard";
import { ClayIcon } from "@/components/clay/ClayIcon";
import { ClayButton } from "@/components/clay/ClayButton";

export interface ProductSceneQuote {
  text: string;
  attribution: string;
}

export interface ProductSceneProps {
  /** A schema-validated `Project` — the flagship of `FeaturedWork` (mockup 2, TASK-54). */
  project: Project;
  /**
   * A real, sourced insight quote pulled from the project's own case-study chapters (resolved by
   * the server-component caller — see `FeaturedWork.tsx`'s `findInsightQuote`). Never invented
   * here; this component only ever renders what it is given.
   */
  quote: ProductSceneQuote;
}

/**
 * ProductScene — the flagship "product scene" for Featured Work (mockup 2: a browser-window mock
 * of the live product instead of a plain card). Server component, no interactivity beyond the
 * shared CSS hover/focus already built into `ClayButton` — the whole thing stays statically
 * prerenderable.
 *
 * Content-truth note: the "Ask…" line inside the browser body is UI chrome (a placeholder
 * affordance), never a specific factual claim — the mockup's literal sample question/answer text
 * is not present anywhere in `data/projects.ts` and is therefore not reproduced (guardrail #2).
 * The "answer" surface below it renders only the project's own sourced tagline plus its first two
 * real, sourced metrics as evidence pills — nothing invented.
 */
export function ProductScene({ project, quote }: ProductSceneProps) {
  const { slug, name, tagline, icon, links, metrics } = project;
  const IconComponent = projectIcon(icon);
  const addressBarLabel = links.live ? links.live.replace(/^https?:\/\//, "") : `${slug} (case study)`;

  return (
    <ClayCard
      tier="hero"
      tone="lavender"
      padding="hero"
      className="grid grid-cols-1 gap-[var(--space-6)] lg:grid-cols-2 lg:items-center lg:gap-[var(--space-9)]"
    >
      {/* Browser-window mock of the live product. Decorative traffic-light dots are neutral
          (ink-3) rather than red/amber/green — DESIGN_DIRECTION's "no rainbow UI" rule and the
          one-accent-per-section discipline both rule out a literal 3-colour set here. */}
      <div className="overflow-hidden rounded-[var(--radius-utility)] bg-bg shadow-[var(--shadow-utility)]">
        <div className="flex items-center gap-[var(--space-3)] border-b border-ink/10 px-[var(--space-4)] py-[var(--space-3)]">
          <span aria-hidden className="flex shrink-0 gap-[6px]">
            <span className="h-2.5 w-2.5 rounded-full bg-ink-3/25" />
            <span className="h-2.5 w-2.5 rounded-full bg-ink-3/25" />
            <span className="h-2.5 w-2.5 rounded-full bg-ink-3/25" />
          </span>
          <span className="min-w-0 flex-1 truncate rounded-[var(--radius-pill)] bg-surface px-[var(--space-3)] py-[2px] text-caption text-ink-3">
            {addressBarLabel}
          </span>
        </div>

        <div className="flex flex-col gap-[var(--space-4)] p-[var(--space-5)]">
          <div className="flex items-center gap-[var(--space-3)]">
            <span
              className="inline-flex w-fit"
              style={{ viewTransitionName: `icon-${slug}` }}
            >
              <ClayIcon icon={IconComponent} size={40} tone="lavender" />
            </span>
            <span className="text-[length:var(--text-h3)] font-bold text-ink">{name}</span>
          </div>

          {/* UI chrome only — not a factual claim (see docstring above). */}
          <div className="rounded-[var(--radius-utility)] bg-surface px-[var(--space-4)] py-[var(--space-3)] text-body text-ink-3">
            Ask about {name}…
          </div>

          <div className="flex flex-col gap-[var(--space-3)] rounded-[var(--radius-utility)] bg-lavender/20 p-[var(--space-4)]">
            <p className="text-body text-ink">{tagline}</p>
            {metrics.length > 0 && (
              <div className="flex flex-wrap gap-[var(--space-2)]">
                {metrics.slice(0, 2).map((metric) => (
                  <span
                    key={metric.label}
                    className="rounded-[var(--radius-pill)] bg-surface px-[var(--space-3)] py-[2px] text-caption font-semibold text-ink-2"
                  >
                    {metric.value} {metric.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pull-quote + CTA (mockup 2's right column). */}
      <div className="flex flex-col items-start gap-[var(--space-4)]">
        <blockquote className="max-w-[28ch] text-[length:var(--text-h3)] font-bold leading-tight text-ink">
          “{quote.text}”
        </blockquote>
        <p className="text-caption text-ink-2">— {quote.attribution}</p>
        <ClayButton
          variant="primary"
          href={`/work/${slug}`}
          style={{ viewTransitionName: `project-${slug}` }}
        >
          {`Explore ${name} →`}
        </ClayButton>
      </div>
    </ClayCard>
  );
}
