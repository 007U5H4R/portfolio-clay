import type { SourceRef } from "@/data/schema";
import type { InsightArtifact } from "./types";
import { Hand } from "@/components/paper";
import { HAND_LIMITS } from "@/components/paper/Hand";
import { ArtifactShell } from "./ArtifactShell";
import { SourceCaption } from "./SourceCaption";

export interface InsightCardProps {
  artifact: InsightArtifact;
  source: SourceRef;
}

/**
 * InsightCard (Design.md §7.3 `insight`): the hand pull-quote — a bare figure (no sheet fill) with the
 * big Fraunces “ glyph, the quote as `blockquote data-hand="quote"` in Caveat, then `cite` +
 * `Source:` in the `figcaption` (the §3.4 cite requirement — both sit in the same `data-paper` scope).
 *
 * §3.4 caps a hand quote at 240 characters. Three sourced quotes in `data/projects.ts` are longer
 * (263–380 chars). D7 forbids trimming data, so a quote over the limit keeps its text verbatim and
 * renders in Fraunces (`.artifact-quote-long`) without `data-hand` — content, not Caveat, so EVAL-018
 * rule 5 never sees it and `Hand`'s render-time guard never throws. Deviation noted in the TKT-83 report.
 */
export function InsightCard({ artifact, source }: InsightCardProps) {
  const quoted = `“${artifact.quote}”`;
  const hand = quoted.length <= HAND_LIMITS.quoteChars;
  const figcaption = (
    <figcaption>
      <cite>— {artifact.attribution}</cite>
      {artifact.caption ? <span className="artifact-caption">{artifact.caption}</span> : null}
      <SourceCaption as="span" source={source} className="artifact-src" />
    </figcaption>
  );

  return (
    <ArtifactShell as="figure" form="insight" label="Insight">
      {hand ? (
        <Hand kind="quote" as="blockquote" cite={figcaption}>
          {quoted}
        </Hand>
      ) : (
        <>
          <blockquote className="artifact-quote-long">{quoted}</blockquote>
          {figcaption}
        </>
      )}
    </ArtifactShell>
  );
}
