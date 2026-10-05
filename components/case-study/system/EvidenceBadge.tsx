import type { EvidenceKind } from "@/data/schema";

/**
 * Spec §19 evidence badges — one system on every case study: ● Measured · ◐ Self-reported ·
 * ◇ Structural · ○ Prototype. The glyph is decorative; the word is the signal (never colour alone).
 */
export const EVIDENCE_BADGES: Record<EvidenceKind, { glyph: string; label: string }> = {
  measured: { glyph: "●", label: "Measured" },
  "self-reported": { glyph: "◐", label: "Self-reported" },
  structural: { glyph: "◇", label: "Structural" },
  prototype: { glyph: "○", label: "Prototype" },
};

export function EvidenceBadge({ kind }: { kind: EvidenceKind }) {
  const badge = EVIDENCE_BADGES[kind];
  return (
    <span className="csx-badge" data-kind={kind} data-micro-label="">
      <span aria-hidden="true" className="csx-badge-glyph">
        {badge.glyph}
      </span>
      {badge.label}
    </span>
  );
}

/** The legend (shown once per page, beside the first evidence block). */
export function BadgeLegend({ kinds }: { kinds?: readonly EvidenceKind[] }) {
  const shown = (Object.keys(EVIDENCE_BADGES) as EvidenceKind[]).filter((kind) => !kinds || kinds.includes(kind));
  return (
    <p className="csx-legend">
      <span className="csx-legend-label" data-micro-label="">
        Evidence key
      </span>
      {shown.map((kind) => (
        <EvidenceBadge key={kind} kind={kind} />
      ))}
    </p>
  );
}
