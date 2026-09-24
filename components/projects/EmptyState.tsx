import { SearchX } from "lucide-react";
import { ClayIcon } from "@/components/clay/ClayIcon";
import { ClayPill } from "@/components/clay/ClayPill";
import { filterHref } from "@/lib/filters";

/**
 * The "empty" screen state for the `/work` grid (TKT-16 AC5, the four-states discipline EVAL-014
 * names). Rendered by `WorkGrid` whenever the active filter matches zero projects — impossible with
 * the current dataset (every filter has ≥1 build), but honestly built and rendered so a filter that
 * ever narrows to nothing is a designed dead-end escape, not a blank void. Copy is honest ("No
 * projects match this filter") and the single control is a live "Show all" link back to `/work`
 * (never a dead control, EVAL-011).
 */
export function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-[var(--space-4)] py-[var(--space-12)] text-center">
      <ClayIcon icon={SearchX} size={56} tone="lavender" />
      <p className="text-[length:var(--text-lead)] font-bold text-navy">
        No projects match this filter
      </p>
      <p className="max-w-[44ch] text-[length:var(--text-body)] text-navy-2">
        Nothing here yet under this lens. Clear the filter to see every build.
      </p>
      <ClayPill variant="link" href={filterHref("all")}>
        Show all
      </ClayPill>
    </div>
  );
}
