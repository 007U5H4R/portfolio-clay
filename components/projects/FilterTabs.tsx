"use client";

import { LazyMotion, domAnimation, m } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, type KeyboardEvent } from "react";
import { FILTERS, filterHref, parseFilter, type FilterValue } from "@/lib/filters";
import { springs, useReducedMotionSafe } from "@/lib/motion";

/**
 * `/work` filter row (TKT-16, Design.md §3 FilterTabs, decision E-2/E-4/TP7).
 *
 * ARIA tabs pattern (`role="tablist"` → `role="tab"` + `aria-selected`, roving `tabindex`, arrow /
 * Home / End / Space keys with automatic activation — AC2, EVAL-007). The tabs are rendered as
 * `role="tab"` LINKS (`<a href>`), not buttons, deliberately:
 *   - progressive enhancement — without JS the link navigates to `/work?filter=<f>` and the client
 *     filters on load (TP7's accepted one-frame flash); with JS `onClick` keeps it a scroll-free
 *     client transition via `router.replace`;
 *   - the dead-control crawler (EVAL-011) GET-checks a link (200) instead of click-testing it — a
 *     default-active tab rendered as a button produces no observable change on click and would be a
 *     false DEAD. `role="tab"` is a valid role for `a[href]` per ARIA-in-HTML, so axe stays clean.
 *
 * Selection lives entirely in the URL (`?filter=`, the single `lib/filters.ts` parser), so
 * back/forward restores state for free. The lavender active indicator is a shared-`layoutId`
 * `m.span` (Design.md §4 "Filter change", `springs.filter`), collapsed to an instant swap under
 * reduced motion (EVAL-010).
 */

const tabBase =
  "relative isolate inline-flex min-h-11 shrink-0 snap-start items-center justify-center " +
  "rounded-[var(--radius-pill)] px-[var(--space-4)] text-caption font-semibold " +
  "transition-[color] duration-200 ease-[var(--ease-hover)] focus-ring";

/** Row layout: scrolls horizontally with a peek < 768 (Deviation 3), wraps inline ≥ 768. */
const tablistClass =
  "flex snap-x gap-[var(--space-2)] overflow-x-auto py-[var(--space-1)] pr-[var(--space-6)] " +
  "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden " +
  "md:flex-wrap md:overflow-visible md:pr-0";

function tabClass(active: boolean): string {
  return `${tabBase} ${active ? "text-navy" : "text-navy-2 hover:text-navy"}`;
}

export function FilterTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = parseFilter(searchParams.get("filter"));
  const reduced = useReducedMotionSafe();
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const activate = (value: FilterValue) => {
    // push (not replace) so each filter is its own history entry — back/forward restores the prior
    // filter (AC2). scroll:false keeps the viewport put; only the grid below swaps (Design.md §4).
    router.push(filterHref(value), { scroll: false });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLAnchorElement>, index: number) => {
    const last = FILTERS.length - 1;
    let next = index;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        next = index === last ? 0 : index + 1;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        next = index === 0 ? last : index - 1;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = last;
        break;
      case " ":
      case "Enter":
        // Links fire onClick on Enter already; handle Space here for tab-widget parity.
        event.preventDefault();
        activate(FILTERS[index]!.value);
        return;
      default:
        return;
    }
    event.preventDefault();
    tabRefs.current[next]?.focus();
    activate(FILTERS[next]!.value); // automatic activation (moves focus + applies the filter)
  };

  return (
    <LazyMotion features={domAnimation} strict>
      <div role="tablist" aria-label="Filter projects" className={tablistClass}>
        {FILTERS.map((filter, index) => {
          const isActive = filter.value === active;
          return (
            <a
              key={filter.value}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              id={`filter-tab-${filter.value}`}
              href={filterHref(filter.value)}
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={(event) => {
                event.preventDefault();
                activate(filter.value);
              }}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={tabClass(isActive)}
            >
              {isActive ? (
                <m.span
                  layoutId="filter-indicator"
                  aria-hidden="true"
                  {...(reduced
                    ? { layout: false as const, transition: { duration: 0 } }
                    : { layout: "position" as const, transition: springs.filter })}
                  className="absolute inset-0 rounded-[var(--radius-pill)] bg-paper-2/30 shadow-[var(--shadow-utility)]"
                />
              ) : null}
              <span className="relative z-10">{filter.label}</span>
            </a>
          );
        })}
      </div>
    </LazyMotion>
  );
}

/**
 * Static, hook-free tab row for the `<Suspense>` fallback (TP7): rendered into the prerendered HTML
 * while `FilterTabs` (which reads `useSearchParams`) is client-rendered. Shows "All" active so the
 * static first paint matches the default `/work` state with no layout shift.
 */
export function FilterTabsFallback() {
  return (
    <div role="tablist" aria-label="Filter projects" className={tablistClass}>
      {FILTERS.map((filter) => {
        const isActive = filter.value === "all";
        return (
          <a
            key={filter.value}
            id={`filter-tab-${filter.value}`}
            href={filterHref(filter.value)}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            className={tabClass(isActive)}
          >
            {isActive ? (
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-[var(--radius-pill)] bg-paper-2/30 shadow-[var(--shadow-utility)]"
              />
            ) : null}
            <span className="relative z-10">{filter.label}</span>
          </a>
        );
      })}
    </div>
  );
}
