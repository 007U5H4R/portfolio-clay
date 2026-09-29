import type { CSSProperties } from "react";
import type { CaseSection } from "@/data/schema";
import { MetricCard } from "@/components/case-study/system/MetricCard";
import { Glyph } from "./glyphs";

/**
 * Journal primitives shared by every bespoke page — extracted only once Cubicle, Dino Arcade and
 * Velora each had their own working identity (redesign brief §62). Each theme restyles them.
 */

const idx = (i: number) => ({ "--i": i }) as CSSProperties;

/** Exactly the recorded learnings (the brief asks for three): number · glyph · one-line title · one sentence. */
export function JournalLearnings({ section, glyphs }: { section: Extract<CaseSection, { kind: "learnings" }>; glyphs: readonly string[] }) {
  return (
    <ul className="jx-learnings" data-count={section.items.length}>
      {section.items.map((item, i) => (
        <li key={item.title} className="jx-learning" style={idx(i)}>
          <Glyph name={glyphs[i] ?? "check"} />
          <span className="jx-learning-n" aria-hidden="true">
            {String(i + 1).padStart(2, "0")}
          </span>
          <h3 className="jx-learning-h">{item.title}</h3>
          <p className="jx-learning-body">{item.body}</p>
        </li>
      ))}
    </ul>
  );
}

/** Evidence that stays rigorous but secondary: proof tiles · a clearly separate not-measured panel · a status stamp. */
export function JournalOutcome({ section, gapsTitle = "Not measured", className }: { section: Extract<CaseSection, { kind: "outcome" }>; gapsTitle?: string; className?: string }) {
  return (
    <div className={["jx-outcome", "jx-flat", className].filter(Boolean).join(" ")}>
      {section.intro ? <p className="jx-lede">{section.intro}</p> : null}
      <ul className="csx-proofs jx-outcome-proofs" data-count={section.proofs.length}>
        {section.proofs.map((proof) => (
          <li key={`${proof.value}-${proof.label}`}>
            <MetricCard proof={proof} />
          </li>
        ))}
      </ul>
      {section.gaps.length > 0 ? (
        <div className="jx-notmeasured" data-paper="card">
          <h3 className="jx-notmeasured-h" data-micro-label="">
            {gapsTitle}
          </h3>
          <ul>
            {section.gaps.map((gap) => (
              <li key={gap}>{gap}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {section.stamp ? (
        <p className="jx-stamp">
          {section.stamp.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </p>
      ) : null}
    </div>
  );
}
