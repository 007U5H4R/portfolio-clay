/**
 * EvidenceLinks (technical-plan.md §B S10.02 → §F TKT-77 S77.01, Design.md §7.1 Ask, EVAL-013) — the
 * 2–3 sourced links shown under every answer, as small ivory pills with a trailing arrow (M-009 paper
 * restyle; previously `ClayPill variant="link"`). Internal hrefs resolve through the build-time content
 * gate (a dangling one fails the build); external `https://` links open in a new tab with
 * `rel="noopener noreferrer"`. Each pill keeps the 44 px target floor (EVAL-008). The arrow is an
 * `aria-hidden` glyph, so the accessible name is the evidence label itself.
 */
import type { Evidence } from "@/lib/ask";
import { isInternalHref } from "@/lib/anchors";

export interface EvidenceLinksProps {
  evidence: Evidence[];
  className?: string | undefined;
}

export function EvidenceLinks({ evidence, className }: EvidenceLinksProps) {
  const classes = ["ask-pills", className].filter(Boolean).join(" ");
  return (
    <ul aria-label="Sources" className={classes}>
      {evidence.map((item) => {
        const external = !isInternalHref(item.href);
        const externalAttrs = external ? { target: "_blank", rel: "noopener noreferrer" } : {};
        return (
          <li key={`${item.href}::${item.label}`}>
            <a href={item.href} className="ask-pill ask-pill-link focus-ring" {...externalAttrs}>
              {item.label}
              <span aria-hidden="true" className="ask-pill-arrow">
                →
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
