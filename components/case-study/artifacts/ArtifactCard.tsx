import type { SourceRef } from "@/data/schema";
import type { GenericArtifact } from "./types";
import { ExternalLink } from "@/components/common/ExternalLink";
import { ArtifactShell } from "./ArtifactShell";

export interface ArtifactCardProps {
  artifact: GenericArtifact;
  source: SourceRef;
}

type GenericKind = GenericArtifact["kind"];

/** kind → eyebrow for the generic document/link tag. */
const kindLabel: Record<GenericKind, string> = {
  prd: "PRD",
  deck: "Deck",
  ledger: "Ledger",
  doc: "Doc",
  link: "Link",
};

const isExternal = (href: string): boolean => !href.startsWith("/");

/**
 * ArtifactCard (Design.md §7.3 `generic`): the kraft doc tag (`Sheet tag`) — eyebrow PRD / Deck /
 * Ledger / Doc / Link, the Fraunces title (a link when the artifact has an `href`), an optional note
 * and the Source line. Text on kraft is navy (terracotta-on-kraft is 4.2:1, corrected in §2.1). The
 * link is scoped to the title, NOT the whole tag: the Source line is itself a link when the source has
 * a public url, and an anchor may never nest inside another anchor. External title links open in a new
 * tab with the standard "(opens in new tab)" note; both title links are running-text links
 * (`data-inline-link`, the WCAG 2.5.8 inline exception).
 */
export function ArtifactCard({ artifact, source }: ArtifactCardProps) {
  const href = artifact.href;

  return (
    <ArtifactShell form="doc" variant="tag" label={kindLabel[artifact.kind]} source={source} caption={artifact.caption}>
      <h3>
        {href ? (
          isExternal(href) ? (
            <ExternalLink href={href} className="text-navy">
              {artifact.title}
            </ExternalLink>
          ) : (
            <a href={href} data-inline-link="" className="focus-ring rounded-[2px]">
              {artifact.title}
            </a>
          )
        ) : (
          artifact.title
        )}
      </h3>
      {artifact.note ? <p className="artifact-note">{artifact.note}</p> : null}
    </ArtifactShell>
  );
}
