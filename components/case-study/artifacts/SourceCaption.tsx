import type { SourceRef } from "@/data/schema";
import { ExternalLink } from "@/components/common/ExternalLink";

export interface SourceCaptionProps {
  /** The resolved SourceRef for the artifact (ArtifactRenderer resolves the id). */
  source: SourceRef;
  className?: string | undefined;
}

/**
 * The provenance line every artifact carries (TKT-20 AC 1). It renders **only** the human
 * `label` (e.g. "TeachSpark Final PRD") — never `source.ref`, which is a local inventory path
 * kept for traceability and must never reach public HTML (TKT-20 security note; EVAL-013/016).
 * When the source declares a public `url`, the label becomes an `ExternalLink`; otherwise it is
 * plain text (a path-only source is a label, never a live link).
 */
export function SourceCaption({ source, className }: SourceCaptionProps) {
  const classes = ["text-caption text-ink-soft", className].filter(Boolean).join(" ");
  return (
    <p className={classes}>
      <span className="font-semibold text-navy-2">Source: </span>
      {source.url ? <ExternalLink href={source.url}>{source.label}</ExternalLink> : source.label}
    </p>
  );
}
