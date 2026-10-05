import type { ReactNode } from "react";
import Link from "next/link";
import type { CaseProof, EvidenceKind } from "@/data/schema";
import { BadgeLegend } from "@/components/case-study/system/EvidenceBadge";
import { MetricCard } from "@/components/case-study/system/MetricCard";

export interface JournalHeroProps {
  slug: string;
  name: string;
  code: string;
  status: string;
  tagline: string;
  beats: readonly string[];
  proposition: string;
  proofs: readonly CaseProof[];
  legendKinds: readonly EvidenceKind[];
  /** The product's own composition: the hand-authored scene with the real UI laid into it. */
  art: ReactNode;
}

/**
 * Journal hero (TASK-130 redesign brief §5–§7): one viewport answers what it is, who it's for, why it
 * is interesting, what proof exists and what the product looks like. Left ≈ 42 %: code · status,
 * name, tagline, beats, a one-line proposition, 2–3 proofs and a tiny evidence key. Right ≈ 58 %:
 * the product's scene, which may bleed past the column.
 */
export function JournalHero({ slug, name, code, status, tagline, beats, proposition, proofs, legendKinds, art }: JournalHeroProps) {
  return (
    <section className="csx-hero jx-hero" aria-labelledby="cs-h">
      <div className="jx-hero-in">
        <div className="jx-hero-copy" data-paper="sheet">
          <p className="csx-crumb">
            <Link href="/projects" className="focus-ring" data-inline-link="">
              Portfolio
            </Link>
            <span aria-hidden="true">/</span>
            <span>Case study</span>
          </p>
          <p className="csx-code jx-code" data-micro-label="">
            <span className="csx-code-id">{code}</span>
            <span aria-hidden="true"> · </span>
            <span>{status}</span>
          </p>
          <h1 id="cs-h" className="csx-h1 jx-h1" style={{ viewTransitionName: `project-${slug}` }}>
            {name}
          </h1>
          <p className="csx-tagline jx-tagline">{tagline}</p>
          {beats.length > 0 ? (
            <p className="jx-beats">
              {beats.map((beat) => (
                <span key={beat}>{beat}</span>
              ))}
            </p>
          ) : null}
          <p className="csx-prop jx-prop">{proposition}</p>
          {proofs.length > 0 ? (
            <div className="jx-hero-proofs">
              <ul className="csx-proofs jx-proofs" data-count={proofs.length}>
                {proofs.map((proof) => (
                  <li key={`${proof.value}-${proof.label}`}>
                    <MetricCard proof={proof} size="lg" />
                  </li>
                ))}
              </ul>
              <BadgeLegend kinds={legendKinds} />
            </div>
          ) : null}
        </div>
        <div className="jx-hero-art">{art}</div>
      </div>
    </section>
  );
}
