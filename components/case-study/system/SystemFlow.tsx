import type { CSSProperties } from "react";
import type { CaseSection } from "@/data/schema";

type System = Extract<CaseSection, { kind: "system" }>;

/**
 * Spec §16–§17: the compact architecture — 3–8 plain-language steps drawn only from recorded
 * components. The `<ol>` IS the diagram's text alternative (every step is real text, in order);
 * each theme draws the connectors in its own vocabulary (track stations, chat hops, state pills…).
 */
export function SystemFlow({ section }: { section: System }) {
  return (
    <div className="csx-system" data-has-rules={section.rules.length > 0 ? "" : undefined}>
      {section.intro ? <p className="csx-lead">{section.intro}</p> : null}
      <figure className="csx-arch" aria-labelledby={`${section.id}-cap`}>
        <ol className="csx-arch-steps">
          {section.steps.map((step, index) => (
            <li key={step.label} className="csx-arch-step" style={{ "--i": index } as CSSProperties}>
              <span className="csx-arch-n" aria-hidden="true" data-micro-label="">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="csx-arch-label">{step.label}</span>
              {step.note ? <span className="csx-arch-note">{step.note}</span> : null}
            </li>
          ))}
        </ol>
        <figcaption id={`${section.id}-cap`} className="csx-arch-cap">
          {section.caption}
        </figcaption>
      </figure>
      {section.rules.length > 0 ? (
        <aside className="csx-rules" data-paper="index" aria-labelledby={`${section.id}-rules`}>
          <h3 id={`${section.id}-rules`} className="csx-h3">
            Key rules
          </h3>
          <ul>
            {section.rules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </aside>
      ) : null}
    </div>
  );
}
