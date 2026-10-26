"use client";

/**
 * OrigamiDesktopGate (TASK-365) — the desktop counterpart to OrigamiBloomGate, kept fully separate so
 * neither can regress the other's tests. On mount it reads the `<html data-intro-desktop>` the
 * pre-paint script set (lib/origami-desktop.ts); without it (phone, tablet, repeat visit, automation)
 * it renders nothing and loads nothing. With it, it claims the intro from the head script's failsafe
 * (`data-intro-desktop-claimed`), lazy-loads the splash chunk and portals it into body; the cover stays
 * up until the splash itself mounts (`data-intro-desktop-live`). If the chunk fails or is late, or the
 * gate unmounts before it arrives (client navigation away), the intro ends and the page shows.
 */
import { useCallback, useEffect, useState, type ComponentType } from "react";
import { createPortal } from "react-dom";
import { INTRO_DESKTOP_CHUNK_BUDGET_MS, INTRO_DESKTOP_DONE_EVENT, type IntroDesktopMode } from "@/lib/origami-desktop";

type SplashProps = { mode: IntroDesktopMode; onDone: () => void };

/** Mounted gates; lets an unmount tell a real navigation from React's dev double-invoke. */
let mountedGates = 0;

export function endIntroDesktopAttributes(): void {
  const d = document.documentElement;
  if (!d.dataset.introDesktop && !d.dataset.introDesktopLive && !d.dataset.introDesktopClaimed) return;
  delete d.dataset.introDesktop;
  delete d.dataset.introDesktopClaimed;
  delete d.dataset.introDesktopLive;
  delete d.dataset.introDesktopPhase;
  window.dispatchEvent(new Event(INTRO_DESKTOP_DONE_EVENT));
}

export function OrigamiDesktopGate() {
  const [splash, setSplash] = useState<{ C: ComponentType<SplashProps>; mode: IntroDesktopMode } | null>(null);

  useEffect(() => {
    mountedGates++;
    const d = document.documentElement;
    const mode = d.dataset.introDesktop;
    let cancelled = false;
    let budget = 0;
    if (mode === "play" || mode === "static") {
      d.dataset.introDesktopClaimed = "1";
      budget = window.setTimeout(() => {
        cancelled = true;
        endIntroDesktopAttributes();
      }, INTRO_DESKTOP_CHUNK_BUDGET_MS);
      import("./OrigamiDesktop")
        .then((m) => {
          if (cancelled) return;
          window.clearTimeout(budget);
          setSplash({ C: m.OrigamiDesktop, mode });
        })
        .catch(() => {
          window.clearTimeout(budget);
          if (!cancelled) endIntroDesktopAttributes();
        });
    }
    return () => {
      mountedGates--;
      cancelled = true;
      window.clearTimeout(budget);
      window.setTimeout(() => {
        if (mountedGates === 0 && !document.documentElement.dataset.introDesktopLive) endIntroDesktopAttributes();
      }, 0);
    };
  }, []);

  const onDone = useCallback(() => setSplash(null), []);

  if (!splash) return null;
  const { C, mode } = splash;
  return createPortal(<C mode={mode} onDone={onDone} />, document.body);
}
