"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef, type KeyboardEvent } from "react";
import { InkUnderline } from "@/components/navigation/InkUnderline";
import { FILTERS, filterHref, parseFilter, type FilterValue } from "@/lib/filters";

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
 * back/forward restores state for free.
 *
 * TKT-80 (Design.md §7.2): restyled as ink-underlined serif tabs — Fraunces 20 px on a 1 px `--line`
 * baseline, the rust hand-drawn underline (`InkUnderline`, link chrome — not a counted decoration)
 * on `aria-selected`, .45 on hover. The M-004 sliding pill indicator is gone, so there is nothing
 * to animate (reduced motion is trivially instant, EVAL-010). Styles: `.work-tabs` in the TKT-80
 * block of app/globals.css. The row wraps at every width (TKT-90b — the < 768 scroll row clipped "Experiments").
 */

const tablistClass = "work-tabs";
const tabClass = "work-tab focus-ring";

export function FilterTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = parseFilter(searchParams.get("filter"));
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
            className={tabClass}
          >
            {filter.label}
            <InkUnderline />
          </a>
        );
      })}
    </div>
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
            className={tabClass}
          >
            {filter.label}
            <InkUnderline />
          </a>
        );
      })}
    </div>
  );
}
