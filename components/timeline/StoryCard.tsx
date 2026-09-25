import type { ReactNode } from "react";
import type { Experience } from "@/data/schema";
import { ExternalLink } from "@/components/common/ExternalLink";
import { FlatZone, Sheet } from "@/components/paper";
import { textStatesKind } from "./timeline-logic";

export interface StoryCardProps {
  role: Experience;
  /** Tilt in degrees (mockup: odd roles −0.4°, even +0.35°); `Sheet` clamps to ±0.9°. */
  rotate?: number | undefined;
}

type Kind = Experience["outcomes"][number]["kind"];

/** The kind-badge words (Design.md §3.4 / Dev-04: Inter 11 px uppercase, never Caveat). */
const KIND_LABEL: Record<Kind, string> = {
  measured: "Measured",
  "self-reported": "Self-reported",
};

/** One `<dt>`/`<dd>` pair; the wrapper `div` is valid inside a `dl` and `display: contents` in CSS. */
function Entry({ term, na, children }: { term: string; na?: boolean; children: ReactNode }) {
  return (
    <div className="story-entry">
      <dt data-micro-label="">{term}</dt>
      <dd className={na ? "story-na" : undefined}>{children}</dd>
    </div>
  );
}

/**
 * StoryCard (TKT-41 → TKT-87, Design.md §7.4 / §11 Dev-11) — one role's story on an ivory
 * `Sheet card`, always open. The `dl` is a flat zone (`data-flat`, §3.2 rule 4): no decoration
 * lives inside it. Server component.
 *
 * Honesty (TKT-41 AC 1): `Scale` renders `role.scale` verbatim, including the literal
 * "not recorded" marker (Inter italic, ink-soft — Dev-04). Each outcome renders verbatim; its kind
 * badge is dropped only when the text already says the kind (AmEx's "(self-reported)"), so the
 * qualifier is never printed twice. The Source line is the data's `SourceRef.label`, linked only
 * when the ref carries a public `url`.
 */
export function StoryCard({ role, rotate }: StoryCardProps) {
  const title = role.companyNote ? `${role.company} (${role.companyNote})` : role.company;

  return (
    <Sheet as="article" variant="card" rotate={rotate} className="story-card">
      <h3>
        {title} — {role.title}
      </h3>

      <FlatZone as="dl" className="story-dl">
        <Entry term="Context">{role.context}</Entry>
        <Entry term="Role">{role.responsibility}</Entry>
        <Entry term="Scale" na={role.scale === "not recorded"}>
          {role.scale}
        </Entry>
        <Entry term="What changed">{role.whatChanged}</Entry>
        <Entry term="Outcomes">
          <ul className="story-outcomes">
            {role.outcomes.map((outcome) => (
              <li key={outcome.text}>
                <span>{outcome.text}</span>
                {textStatesKind(outcome.text, KIND_LABEL[outcome.kind]) ? null : (
                  <span className="story-kind" data-kind={outcome.kind} data-micro-label="">
                    {KIND_LABEL[outcome.kind]}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Entry>
      </FlatZone>

      <p className="story-src">
        Source:{" "}
        {role.sources.map((source, i) => (
          <span key={source.id}>
            {i > 0 ? " · " : null}
            {source.url ? <ExternalLink href={source.url}>{source.label}</ExternalLink> : source.label}
          </span>
        ))}
      </p>
    </Sheet>
  );
}
