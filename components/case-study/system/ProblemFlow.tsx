import type { CSSProperties } from "react";
import type { CaseSection } from "@/data/schema";

type Problem = Extract<CaseSection, { kind: "problem" }>;

/**
 * Spec §10–§11: one strong sentence (the section h2), one short context line, then ONE visual —
 * a before-workflow (`flow`) and/or an evidence fragment (`quote`). The flow is an ordered list, so
 * the diagram is its own text alternative.
 */
export function ProblemFlow({ section }: { section: Problem }) {
  return (
    <div className="csx-problem">
      <p className="csx-lead">{section.context}</p>
      {section.flow ? (
        <figure className="csx-flow">
          <figcaption className="csx-flow-cap" data-micro-label="">{section.flow.caption}</figcaption>
          <ol className="csx-flow-steps">
            {section.flow.steps.map((step, index) => (
              <li key={step.label} className="csx-flow-step" style={{ "--i": index } as CSSProperties}>
                <span className="csx-flow-n" aria-hidden="true" data-micro-label="">
                  {index + 1}
                </span>
                <span className="csx-flow-label">{step.label}</span>
                {step.note ? <span className="csx-flow-note">{step.note}</span> : null}
              </li>
            ))}
          </ol>
        </figure>
      ) : null}
      {section.quote ? (
        <figure className="csx-quote">
          <blockquote>
            <p>{section.quote.text}</p>
          </blockquote>
          <figcaption>— {section.quote.attribution}</figcaption>
        </figure>
      ) : null}
    </div>
  );
}
