import type { CSSProperties } from "react";
import type { CaseSection, EvidenceKind } from "@/data/schema";
import { formatAsOf } from "@/lib/format";
import { BadgeLegend, EvidenceBadge } from "./EvidenceBadge";
import { MetricCard } from "./MetricCard";

type Outcome = Extract<CaseSection, { kind: "outcome" }>;
type Funnel = NonNullable<Outcome["funnel"]>;

/**
 * Spec §18–§20: evidence cards, each with its badge; a funnel only where one was recorded; and the
 * honest gaps ("What isn't measured") so an absent number is stated, never implied.
 */
export function OutcomeBoard({ section, legendKinds }: { section: Outcome; legendKinds: readonly EvidenceKind[] }) {
  return (
    <div className="csx-outcome">
      {section.intro ? <p className="csx-lead">{section.intro}</p> : null}
      {legendKinds.length > 0 ? <BadgeLegend kinds={legendKinds} /> : null}
      {section.funnel ? <FunnelChart funnel={section.funnel} /> : null}
      {section.proofs.length > 0 ? (
        // < 768 the cards swipe sideways (spec §34), so the scroller is a labelled, focusable region
        // a keyboard can scroll (axe scrollable-region-focusable); ≥ 768 it is a plain grid.
        <div className="csx-swipe focus-ring" role="region" aria-label="Evidence cards" tabIndex={0}>
          <ul className="csx-proofs" data-count={section.proofs.length}>
            {section.proofs.map((proof) => (
              <li key={proof.label}>
                <MetricCard proof={proof} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {section.gaps.length > 0 ? (
        <div className="csx-gaps">
          <h3 className="csx-h3">What isn’t measured</h3>
          <ul>
            {section.gaps.map((gap) => (
              <li key={gap}>{gap}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

/** A recorded funnel: an ordered list (the text alternative) whose bars are sized to the first step. */
export function FunnelChart({ funnel }: { funnel: Funnel }) {
  const top = Math.max(...funnel.steps.map((step) => step.value), 1);
  return (
    <figure className="csx-funnel" aria-labelledby="funnel-cap">
      <ol className="csx-funnel-steps">
        {funnel.steps.map((step, index) => (
          <li key={step.label} className="csx-funnel-step" style={{ "--w": `${Math.max((step.value / top) * 100, 4)}%`, "--i": index } as CSSProperties}>
            <span className="csx-funnel-bar" aria-hidden="true" />
            <span className="csx-funnel-value">{step.value}</span>
            <span className="csx-funnel-label">
              {step.label}
              {step.note ? <span className="csx-funnel-note"> · {step.note}</span> : null}
            </span>
          </li>
        ))}
      </ol>
      <figcaption id="funnel-cap" className="csx-funnel-cap">
        {funnel.caption} <EvidenceBadge kind={funnel.kind} /> <span className="csx-metric-date" data-micro-label="">{formatAsOf(funnel.asOf)}</span>
      </figcaption>
    </figure>
  );
}
