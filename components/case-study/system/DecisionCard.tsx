import type { CSSProperties } from "react";
import type { CaseSection } from "@/data/schema";

type Decision = Extract<CaseSection, { kind: "decisions" }>["items"][number];

/** Spec §14–§15: "Could have → Chose → Because" — the trade-off, not a process description. */
export function DecisionCard({ decision, index }: { decision: Decision; index: number }) {
  return (
    <article className="csx-decision" data-paper="card" style={{ "--i": index } as CSSProperties}>
      <dl>
        <div className="csx-decision-row" data-row="could">
          <dt data-micro-label="">Could have</dt>
          <dd>{decision.could}</dd>
        </div>
        <div className="csx-decision-row" data-row="chose">
          <dt data-micro-label="">Chose</dt>
          <dd>{decision.chose}</dd>
        </div>
        <div className="csx-decision-row" data-row="because">
          <dt data-micro-label="">Because</dt>
          <dd>{decision.because}</dd>
        </div>
      </dl>
    </article>
  );
}
