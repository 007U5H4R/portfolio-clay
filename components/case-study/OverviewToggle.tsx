"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { TornEdge } from "@/components/paper/TornEdge";
import { scrollToTarget } from "@/lib/smooth-scroll";
import { Container } from "@/components/layout/Container";

type View = "summary" | "deep";

export interface OverviewToggleProps {
  /** Left `depth` column content above the tabs: eyebrow, sr-only h2, the thirty-seconds annotation. */
  intro: ReactNode;
  /** Right column: the 30-sec notebook (and, on a thin project, the "Deep dive coming" tag). */
  notebook: ReactNode;
  /**
   * The deep-dive section (`section#deep`, TKT-83) — rendered as the overview's next sibling only
   * while "Deep dive" is selected. Omit it for a thin project: then no tabs render at all.
   */
  deep?: ReactNode | undefined;
  /** Help line under the tabs (what the deep dive adds). */
  help?: string | undefined;
  /** Every in-page id that lives inside `deep` (`deep`, `01-context`, …) — a hash to one opens it. */
  deepIds?: readonly string[] | undefined;
}

const NO_IDS: readonly string[] = [];

const OPTIONS: { view: View; label: string }[] = [
  { view: "summary", label: "30-sec" },
  { view: "deep", label: "Deep dive" },
];

/**
 * The case-study overview section (TKT-81, Design.md §7.3 "Overview", §3.3 = torn + annotation → 2):
 * `section aria-labelledby="ov-h"` on `paper` with a torn top; left the depth column (intro, the
 * **folder tabs**, help), right the notebook.
 *
 * The tabs are a WAI-ARIA `radiogroup` (TC-156 step 1, EVAL-007): roving tabindex (only the checked
 * radio is a Tab stop), arrow keys move AND select, Space/Enter select the focused tab. "Deep dive"
 * mounts the `deep` section directly below this one; "30-sec" (the default) unmounts it, so the page
 * stays a short read until the reader asks for depth. A URL hash that points inside the deep dive
 * (`#deep`, `#01-context`, … — TP8 anchors) opens it on load / hashchange and scrolls to the target,
 * so a shared chapter link never lands on a missing id. The tabs only render when `deep` is given.
 */
export function OverviewToggle({ intro, notebook, deep, help, deepIds = NO_IDS }: OverviewToggleProps) {
  const [view, setView] = useState<View>("summary");
  // The hashed id waiting to be scrolled to once the deep section mounts; `hashTick` re-runs the
  // scroll effect for a new hash even when the deep dive is already open.
  const pendingHash = useRef<string | null>(null);
  const [hashTick, setHashTick] = useState(0);
  const groupRef = useRef<HTMLDivElement>(null);
  const hasDeep = deep !== undefined && deep !== null;

  // Open the deep dive when the URL points inside it (initial load and later hash changes).
  useEffect(() => {
    if (!hasDeep) return;
    const ids = new Set(deepIds);
    const sync = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (id && ids.has(id)) {
        pendingHash.current = id;
        setView("deep");
        setHashTick((tick) => tick + 1);
      }
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [hasDeep, deepIds]);

  // Once the deep section is mounted, bring the hashed target into view (Lenis-aware, EXE-16).
  useEffect(() => {
    const id = pendingHash.current;
    if (!id || view !== "deep") return;
    pendingHash.current = null;
    const target = document.getElementById(id);
    if (target && !scrollToTarget(target, { immediate: true })) target.scrollIntoView();
  }, [hashTick, view]);

  const focusOption = (next: View) => {
    setView(next);
    groupRef.current?.querySelector<HTMLButtonElement>(`button[data-view="${next}"]`)?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(event.key)) {
      event.preventDefault();
      focusOption(view === "summary" ? "deep" : "summary");
    }
  };

  return (
    <>
      <section className="cs-overview cs-torn-fill" aria-labelledby="ov-h">
        <TornEdge fill="paper" />
        <Container className="cs-overview-grid">
          <div className="cs-depth">
            {intro}
            {hasDeep ? (
              <>
                <div
                  ref={groupRef}
                  role="radiogroup"
                  aria-label="Case-study depth"
                  onKeyDown={onKeyDown}
                  className="cs-tabs"
                >
                  {OPTIONS.map((option) => {
                    const checked = option.view === view;
                    return (
                      <button
                        key={option.view}
                        type="button"
                        role="radio"
                        aria-checked={checked}
                        data-view={option.view}
                        tabIndex={checked ? 0 : -1}
                        onClick={() => setView(option.view)}
                        className="cs-tab focus-ring"
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
                {help ? <p className="cs-help">{help}</p> : null}
              </>
            ) : null}
          </div>
          {notebook}
        </Container>
      </section>
      {hasDeep && view === "deep" ? (
        // `key` replays the `.overview-panel` fade each time the deep dive opens (reduced motion: instant).
        <div key="deep" className="overview-panel">
          {deep}
        </div>
      ) : null}
    </>
  );
}
