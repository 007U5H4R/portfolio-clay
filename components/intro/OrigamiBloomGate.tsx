"use client";

/**
 * OrigamiBloomGate (TASK-360) — the only intro code on the homepage bundle. On mount it reads the
 * `<html data-intro>` the pre-paint script set (lib/origami-bloom.ts); without it (desktop, tablet,
 * repeat visit, automation) it renders nothing and loads nothing. With it, it takes over from the
 * head script's failsafe (`data-intro-live`), lazy-loads the splash chunk and portals it into body.
 * If the chunk fails or is slow, the intro ends and the homepage simply shows.
 */
import { useEffect, useState, type ComponentType } from "react";
import { createPortal } from "react-dom";
import { INTRO_DONE_EVENT, type IntroMode } from "@/lib/origami-bloom";

type SplashProps = { mode: IntroMode; onDone: () => void };

/** Budget for the splash chunk to arrive once the gate has taken over. */
const CHUNK_BUDGET_MS = 900;

export function endIntroAttributes(): void {
  const d = document.documentElement;
  if (!d.dataset.intro && !d.dataset.introLive) return;
  delete d.dataset.intro;
  delete d.dataset.introLive;
  delete d.dataset.introPhase;
  window.dispatchEvent(new Event(INTRO_DONE_EVENT));
}

export function OrigamiBloomGate() {
  const [splash, setSplash] = useState<{ C: ComponentType<SplashProps>; mode: IntroMode } | null>(null);

  useEffect(() => {
    const d = document.documentElement;
    const mode = d.dataset.intro;
    if (mode !== "play" && mode !== "static") return;
    d.dataset.introLive = "1";
    let cancelled = false;
    const budget = window.setTimeout(() => {
      cancelled = true;
      endIntroAttributes();
    }, CHUNK_BUDGET_MS);
    import("./OrigamiBloom")
      .then((m) => {
        if (cancelled) return;
        window.clearTimeout(budget);
        setSplash({ C: m.OrigamiBloom, mode });
      })
      .catch(() => {
        window.clearTimeout(budget);
        if (!cancelled) endIntroAttributes();
      });
    return () => {
      cancelled = true;
      window.clearTimeout(budget);
    };
  }, []);

  if (!splash) return null;
  const { C, mode } = splash;
  return createPortal(<C mode={mode} onDone={() => setSplash(null)} />, document.body);
}
