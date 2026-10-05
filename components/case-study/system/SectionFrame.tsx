import type { ReactNode } from "react";
import { Container } from "@/components/layout/Container";

export interface SectionFrameProps {
  id: string;
  kind: string;
  number: number;
  eyebrow: string;
  headline: string;
  /** Legacy `NN-slug` chapter anchors that land here (old deep links keep resolving). */
  anchors?: readonly string[];
  /** Product-specific decorations (≤ 2, `data-decor`, aria-hidden) — EVAL-018 budget is 4. */
  decor?: ReactNode;
  children: ReactNode;
}

/**
 * The shared section shell (spec §3, §24–§25): a numbered marker that each theme draws in its own
 * motif (station stop, notebook tab, passport stamp, state LED, ink numeral…), the eyebrow, one h2
 * that carries the section's single message (spec §30), then the body. `data-cs-reveal` hands the
 * section to `CaseMotion` for its one-time, product-specific entrance.
 */
export function SectionFrame({ id, kind, number, eyebrow, headline, anchors = [], decor, children }: SectionFrameProps) {
  const numeral = String(number).padStart(2, "0");
  return (
    <section id={id} className="csx-sec" data-kind={kind} aria-labelledby={`${id}-h`} data-cs-reveal="">
      {anchors.map((anchor) => (
        <span key={anchor} id={anchor} className="csx-anchor" aria-hidden="true" />
      ))}
      <Container className="csx-sec-in">
        <span className="csx-mark" aria-hidden="true">
          <span className="csx-mark-n">{numeral}</span>
        </span>
        <div className="csx-sec-head">
          <p className="csx-eyebrow" data-micro-label="">{eyebrow}</p>
          <h2 id={`${id}-h`} className="csx-h2">
            {headline}
          </h2>
        </div>
        <div className="csx-sec-body">{children}</div>
        {decor}
      </Container>
    </section>
  );
}
