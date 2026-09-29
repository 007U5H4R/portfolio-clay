import type { CaseSection } from "@/data/schema";

type Pivot = Extract<CaseSection, { kind: "pivot" }>;

/**
 * Spec §49: the pivot as one visual — the original bet struck through, the evidence that killed it,
 * the decision, and what survived. Real text throughout; the strike and the arrows are styling.
 */
export function PivotFlow({ section }: { section: Pivot }) {
  return (
    <ol className="csx-pivot">
      <li className="csx-pivot-step" data-step="from" data-paper="card">
        <p className="csx-pivot-tag" data-micro-label="">The first bet</p>
        <p className="csx-pivot-name">
          <s>{section.from.name}</s> <span className="csx-pivot-x" aria-hidden="true">✕</span>
        </p>
        <p className="csx-pivot-line">{section.from.line}</p>
      </li>
      <li className="csx-pivot-step" data-step="evidence">
        <p className="csx-pivot-tag" data-micro-label="">The evidence</p>
        <ul>
          {section.evidence.map((item) => (
            <li key={item.text}>{item.text}</li>
          ))}
        </ul>
      </li>
      <li className="csx-pivot-step" data-step="decision">
        <p className="csx-pivot-tag" data-micro-label="">The decision</p>
        <p className="csx-pivot-line">{section.decision.text}</p>
      </li>
      <li className="csx-pivot-step" data-step="to" data-paper="card">
        <p className="csx-pivot-tag" data-micro-label="">What survived</p>
        <p className="csx-pivot-name">{section.to.name}</p>
        <p className="csx-pivot-line">{section.to.line}</p>
      </li>
    </ol>
  );
}
