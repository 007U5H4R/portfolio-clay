import Link from "next/link";
import { Hand, Pin, Sheet } from "@/components/paper";
import { filterHref } from "@/lib/filters";

/**
 * The "empty" screen state of the `/work` index (TKT-16 AC5 → TKT-80 · TSK-40, Design.md §7.2
 * "States"; Dev-05). `WorkGrid` renders it INSTEAD of the list, and only when the active filter
 * matches zero projects — it is a screen state, not a decoration, so it never sits in the DOM beside
 * a populated index (the mockup's always-visible card is dropped). The paper form is the pinned,
 * ruled index card (`Sheet variant="index"` + `Pin` — content paper and a fastener, neither
 * counted). Copy unchanged; the single control is a live "Show all →" link back to `/work`
 * (never a dead control, EVAL-011) in the Caveat cta exemption (§3.4).
 */
export function EmptyState() {
  return (
    <Sheet variant="index" rotate={0.6} className="work-empty">
      <Pin tone="steel" />
      <h3 className="work-empty-h">No projects match this filter</h3>
      <p className="work-empty-body">
        Nothing here yet under this lens. Clear the filter to see every build.
      </p>
      <Link href={filterHref("all")} className="work-empty-cta focus-ring" scroll={false}>
        <Hand kind="cta">Show all →</Hand>
      </Link>
    </Sheet>
  );
}
