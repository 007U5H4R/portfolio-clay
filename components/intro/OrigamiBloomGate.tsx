"use client";

/**
 * OrigamiBloomGate (TASK-360; splash swapped to OrigamiBeach in TASK-362) — the only intro code on the homepage bundle. On mount it reads the
 * `<html data-intro>` the pre-paint script set (lib/origami-bloom.ts); without it (desktop, tablet,
 * repeat visit, automation) it renders nothing and loads nothing. With it, it claims the intro from the
 * head script's failsafe (`data-intro-claimed`), lazy-loads the splash chunk and portals it into body;
 * the cover stays up until the splash itself mounts (`data-intro-live`). If the chunk fails or is late,
 * or the gate unmounts before it arrives (client navigation away), the intro ends and the page shows.
 */
import { useCallback, useEffect, useState, type ComponentType } from "react";
import { createPortal } from "react-dom";
import { INTRO_CHUNK_BUDGET_MS, INTRO_DONE_EVENT, type IntroMode } from "@/lib/origami-bloom";

type SplashProps = { mode: IntroMode; onDone: () => void };

/** Mounted gates; lets an unmount tell a real navigation from React's dev double-invoke. */
let mountedGates = 0;

export function endIntroAttributes(): void {
  const d = document.documentElement;
  if (!d.dataset.intro && !d.dataset.introLive && !d.dataset.introClaimed) return;
  delete d.dataset.intro;
  delete d.dataset.introClaimed;
  delete d.dataset.introLive;
  delete d.dataset.introPhase;
  window.dispatchEvent(new Event(INTRO_DONE_EVENT));
}

export function OrigamiBloomGate() {
  const [splash, setSplash] = useState<{ C: ComponentType<SplashProps>; mode: IntroMode } | null>(null);

  useEffect(() => {
    mountedGates++;
    const d = document.documentElement;
    const mode = d.dataset.intro;
    let cancelled = false;
    let budget = 0;
    if (mode === "play" || mode === "static") {
      d.dataset.introClaimed = "1";
      budget = window.setTimeout(() => {
        cancelled = true;
        endIntroAttributes();
      }, INTRO_CHUNK_BUDGET_MS);
      import("./OrigamiBeach")
        .then((m) => {
          if (cancelled) return;
          window.clearTimeout(budget);
          setSplash({ C: m.OrigamiBeach, mode });
        })
        .catch(() => {
          window.clearTimeout(budget);
          if (!cancelled) endIntroAttributes();
        });
    }
    return () => {
      mountedGates--;
      cancelled = true;
      window.clearTimeout(budget);
      // Unmounted before the splash took over (e.g. client navigation away mid-load): end the intro so
      // the cover and the scroll lock never outlive the homepage. Deferred one task so React's dev
      // double-invoke (unmount + immediate remount) does not end a live intro; once the splash has
      // mounted it owns the ending (its own cleanup), and this is a no-op.
      window.setTimeout(() => {
        if (mountedGates === 0 && !document.documentElement.dataset.introLive) endIntroAttributes();
      }, 0);
    };
  }, []);

  // Stable, so the splash's asset deadline is not restarted by a re-render.
  const onDone = useCallback(() => setSplash(null), []);

  if (!splash) return null;
  const { C, mode } = splash;
  return createPortal(<C mode={mode} onDone={onDone} />, document.body);
}
