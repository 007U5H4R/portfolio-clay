"use client";

import { useSearchParams } from "next/navigation";
import type { Project } from "@/data/schema";
import { applyFilter, parseFilter } from "@/lib/filters";
import { EditorialGrid } from "./EditorialGrid";
import { EmptyState } from "./EmptyState";

/**
 * Client filter wrapper for the `/work` grid (TKT-16, decision E-4/TP7). Reads the active filter
 * from the URL (`useSearchParams`, the single `lib/filters.ts` parser) — NOT from a server-read
 * `searchParams` prop, which would make the route dynamic — and renders the matching subset. It
 * must live inside a `<Suspense>` boundary (the page provides one whose fallback prerenders the full
 * unfiltered grid), so `/work` stays statically prerendered and a deep link only pays a one-frame
 * flash before the client narrows the set.
 *
 * The grid region is the `tabpanel` for `FilterTabs`, labelled by the active tab. When the filter
 * matches nothing it shows `EmptyState` (AC5) instead of an empty grid.
 */
export interface WorkGridProps {
  /** The personal-build projects (professional entries render in the ExperienceStrip, TKT-17). */
  projects: Project[];
}

export function WorkGrid({ projects }: WorkGridProps) {
  const searchParams = useSearchParams();
  const filter = parseFilter(searchParams.get("filter"));
  const filtered = applyFilter(projects, filter);

  return (
    <div
      role="tabpanel"
      aria-labelledby={`filter-tab-${filter}`}
      className="mt-[var(--space-8)]"
    >
      {filtered.length === 0 ? <EmptyState /> : <EditorialGrid projects={filtered} />}
    </div>
  );
}
