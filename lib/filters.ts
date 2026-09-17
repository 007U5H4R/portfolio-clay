import type { Project } from "@/data/schema";
import { WORK_FILTERS } from "@/lib/anchors";

/**
 * The single `?filter=` parser + definitions for `/work` (TKT-16, decision E-2). The filter set is
 * derived from the schema `Filter` enum (mirrored by `WORK_FILTERS` in `lib/anchors.ts`, the source
 * `routes()` and `validate-content` resolve `/work?filter=<f>` against) plus the synthetic `all`
 * sentinel. `all` is represented in the URL as the bare `/work` route — never `?filter=all` — so the
 * only query key/values that ever appear are the four E-2-permitted ones and every filter href is a
 * route `routes()` already knows.
 *
 * This module is the ONLY place that reads/writes the `?filter=` key: `FilterTabs` (link hrefs +
 * activation) and `WorkGrid` (client filtering) both go through `parseFilter`/`filterHref`/
 * `applyFilter`, so a stray `?tab=` or an unknown value can never resolve (it collapses to `all`).
 * Imported as a type-only `Project` so no client bundle pulls in zod.
 */

/** The four real filter values (`ai | enterprise | cloud | experiments`). */
export type WorkFilter = (typeof WORK_FILTERS)[number];
/** A filter value including the `all` sentinel (the default / "show everything" state). */
export type FilterValue = "all" | WorkFilter;

export interface FilterDef {
  value: FilterValue;
  /** The tab label (Design.md §3 / SITEMAP.md: All · AI · Enterprise · Cloud · Experiments). */
  label: string;
}

/** Tab order (Design.md §3 FilterTabs). `all` first, then the schema enum order. */
export const FILTERS: readonly FilterDef[] = [
  { value: "all", label: "All" },
  { value: "ai", label: "AI" },
  { value: "enterprise", label: "Enterprise" },
  { value: "cloud", label: "Cloud" },
  { value: "experiments", label: "Experiments" },
] as const;

const VALID_FILTERS = new Set<string>(FILTERS.map((f) => f.value));

/** Parse the `?filter=` param — an unknown/absent/`all` value collapses to `all` (E-2). */
export function parseFilter(param: string | null | undefined): FilterValue {
  return param && VALID_FILTERS.has(param) ? (param as FilterValue) : "all";
}

/** The canonical href for a filter value: `/work` for `all`, `/work?filter=<f>` otherwise (E-2). */
export function filterHref(value: FilterValue): string {
  return value === "all" ? "/work" : `/work?filter=${value}`;
}

/** Filter a project list by a parsed filter value (`all` returns the list unchanged). */
export function applyFilter(items: Project[], filter: FilterValue): Project[] {
  if (filter === "all") return items;
  return items.filter((project) => project.filters.includes(filter));
}
