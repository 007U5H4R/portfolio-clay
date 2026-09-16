/**
 * EvidenceLinks (technical-plan.md §B S10.02, Design.md §3, EVAL-013) — the 2–3 sourced links shown
 * under every answer ("View RailCite →"). Rendered as `ClayPill variant="link"` (a pill with a
 * trailing arrow). Internal hrefs resolve through the build-time content gate (a dangling one fails
 * the build); external `https://` links open in a new tab with `rel="noopener noreferrer"`.
 *
 * Deviation (documented): the plan suggested `next/link` for internal hrefs. `ClayPill variant="link"`
 * is the established evidence-link primitive across the design system (it owns the pill styling and
 * trailing arrow), so using it for both internal and external keeps one styled control rather than
 * duplicating its classes onto a `next/link`. Internal navigation is a plain in-app anchor, which is
 * correct for a portfolio; the only behavioural difference (client-side prefetch) is not load-bearing.
 */
import type { Evidence } from "@/lib/ask";
import { isInternalHref } from "@/lib/anchors";
import { ClayPill } from "@/components/clay/ClayPill";

export interface EvidenceLinksProps {
  evidence: Evidence[];
  className?: string | undefined;
}

export function EvidenceLinks({ evidence, className }: EvidenceLinksProps) {
  const classes = ["flex flex-wrap gap-[var(--space-3)]", className].filter(Boolean).join(" ");
  return (
    <ul aria-label="Sources" className={classes}>
      {evidence.map((item) => {
        const external = !isInternalHref(item.href);
        const externalAttrs = external
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {};
        return (
          <li key={`${item.href}::${item.label}`}>
            <ClayPill variant="link" href={item.href} {...externalAttrs}>
              {item.label}
            </ClayPill>
          </li>
        );
      })}
    </ul>
  );
}
