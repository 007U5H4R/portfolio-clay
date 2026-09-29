import type { CaseSection } from "@/data/schema";

type Research = Extract<CaseSection, { kind: "research" }>;

/** Research as evidence fragments (spec §3 "Research / Discovery"): up to three quotes, one insight. */
export function ResearchWall({ section }: { section: Research }) {
  return (
    <div className="csx-research">
      {section.intro ? <p className="csx-lead">{section.intro}</p> : null}
      <ul className="csx-quotes" data-count={section.quotes.length}>
        {section.quotes.map((quote) => (
          <li key={quote.text}>
            <figure className="csx-quote" data-paper="card">
              <blockquote>
                <p>“{quote.text}”</p>
              </blockquote>
              <figcaption>— {quote.attribution}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
      {section.insight ? (
        <p className="csx-insight">
          <span className="csx-insight-tag" data-micro-label="">Insight</span> {section.insight.text}
        </p>
      ) : null}
    </div>
  );
}
