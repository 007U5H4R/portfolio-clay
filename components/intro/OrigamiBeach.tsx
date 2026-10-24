"use client";

/**
 * Origami Beach Flight (TASK-362) — the ~4.4 s phone welcome splash, loaded only by OrigamiBloomGate when
 * the pre-paint script marked the visit eligible. A cobalt paper plane crosses an origami beach bottom to
 * top; its tail uncovers the TP monogram, the name and tagline rise in, then a four-object loader plays
 * before the splash wipes upward to the homepage. The beach is a CSS background and the plane an
 * aria-hidden <img>, so neither can become the page's LCP element (the hero image underneath stays the
 * LCP). Timing lives in CSS keyframes keyed to INTRO_FRAMES; this file owns the lifecycle: asset loading
 * and its deadline, Skip / Escape, tab hide, the end signal.
 *
 * Sound (TASK-363, TASK-364) remembers the visitor's choice: the first splash ever shown has sound off,
 * with a Sound button next to Skip — mobile browsers block autoplay audio until a user gesture, so the
 * three cues (swoosh, tick, page-flip) are only created, and their files only downloaded, once that
 * button is tapped. From then on the choice is saved (localStorage), so every later splash enables sound
 * automatically on mount; the browser may still block it if this visit itself has had no interaction yet,
 * in which case it fails silently and the button remains as a fallback. There's no sound in "static" mode
 * (reduced motion / the instant finish), and any playing cue is paused the moment the tab hides or the
 * splash ends.
 */
import "@/app/styles/origami-beach.css";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { site } from "@/lib/site";
import {
  INTRO_ASSETS_AT,
  INTRO_FLIGHT_ASSETS,
  INTRO_QUICK_EXIT_MS,
  INTRO_STATIC_HOLD_MS,
  INTRO_TOTAL_MS,
  INTRO_TRANSITION_AT,
  markIntroSeen,
  type IntroMode,
} from "@/lib/origami-bloom";
import { endIntroAttributes } from "./OrigamiBloomGate";

const ASSET_DIR = "/origami-beach";
const LOADER = ["boat", "star", "palm", "miniplane"] as const;
/** Quiet by default — never louder than a gentle notification. */
const SFX_VOLUME = 0.32;
/** Set once the Sound button is tapped; read on mount to auto-enable sound on later splashes. */
const SOUND_PREF_KEY = "ob-sound-pref";

type Theme = "light" | "dark";
type Sfx = "swoosh" | "tick" | "pageflip";

function loadImage(src: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.decoding = "async";
  (img as HTMLImageElement & { fetchPriority?: string }).fetchPriority = "low";
  img.src = src;
  return img.decode().then(() => img);
}

function Monogram({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <path pathLength={1} d="M6 9 C 14 7, 22 8, 30 7" strokeWidth="2.4" />
      <path pathLength={1} d="M17 8 C 15 16, 13 24, 12 33" strokeWidth="2.4" />
      <path pathLength={1} d="M23 12 C 24 20, 22 27, 21 33" strokeWidth="2.2" />
      <path pathLength={1} d="M23 12 C 30 10, 35 13, 34 18 C 33 23, 27 24, 22 22" strokeWidth="2.2" />
    </svg>
  );
}

/** Make every body child except the splash inert (skipping ones already inert); returns what changed. */
function holdPage(splash: HTMLElement | null): HTMLElement[] {
  const held: HTMLElement[] = [];
  for (const el of Array.from(document.body.children)) {
    if (!(el instanceof HTMLElement) || el === splash || el.contains(splash) || el.inert) continue;
    if (el.tagName === "SCRIPT" || el.tagName === "STYLE" || el.tagName === "LINK") continue;
    el.inert = true;
    held.push(el);
  }
  return held;
}

function releasePage(held: HTMLElement[]) {
  for (const el of held) el.inert = false;
  held.length = 0;
}

export function OrigamiBeach({ mode, onDone }: { mode: IntroMode; onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const ended = useRef(false);
  const prevFocus = useRef<Element | null>(null);
  /** Page elements this splash made inert; released at the end. */
  const inerted = useRef<HTMLElement[]>([]);
  const [theme] = useState<Theme>(() => (document.documentElement.dataset.theme === "dark" ? "dark" : "light"));
  const [exiting, setExiting] = useState(false);
  const [ready, setReady] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  /** Mirrors soundOn for scheduled callbacks that read it after the tap, not at schedule time. */
  const soundOnRef = useRef(false);
  const sfx = useRef<Partial<Record<Sfx, HTMLAudioElement>>>({});

  const pauseAllSfx = useCallback(() => {
    for (const el of Object.values(sfx.current)) {
      el.pause();
      el.currentTime = 0;
    }
  }, []);

  /** First call only: creates the three cues, so their files download once sound is actually wanted. */
  const enableSound = useCallback(() => {
    if (soundOnRef.current) return;
    soundOnRef.current = true;
    setSoundOn(true);
    try {
      window.localStorage.setItem(SOUND_PREF_KEY, "on");
    } catch {
      /* private mode / storage disabled: the choice just won't be remembered next time */
    }
    (["swoosh", "tick", "pageflip"] as const).forEach((key) => {
      const el = new Audio(`${ASSET_DIR}/${key}.mp3`);
      el.volume = SFX_VOLUME;
      el.preload = "auto";
      sfx.current[key] = el;
    });
  }, []);

  const playSfx = useCallback((key: Sfx) => {
    if (!soundOnRef.current) return;
    const el = sfx.current[key];
    if (!el) return;
    el.currentTime = 0;
    el.play().catch(() => {
      /* autoplay/decoding can still fail silently; the splash never depends on sound */
    });
  }, []);

  const finish = useCallback(
    (restoreFocus: boolean) => {
      if (ended.current) return;
      ended.current = true;
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
      pauseAllSfx();
      const hadFocus = root.current?.contains(document.activeElement) ?? false;
      releasePage(inerted.current);
      endIntroAttributes();
      if (restoreFocus && hadFocus) {
        const prev = prevFocus.current;
        if (prev instanceof HTMLElement && prev.isConnected && prev !== document.body) prev.focus({ preventScroll: true });
        else (document.activeElement as HTMLElement | null)?.blur();
      }
      onDone();
    },
    [onDone, pauseAllSfx],
  );

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  /** Skip / Escape / missed asset deadline: a short fade, then the homepage. */
  const quickExit = useCallback(() => {
    if (ended.current) return;
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    setExiting(true);
    later(() => finish(true), mode === "static" ? 0 : INTRO_QUICK_EXIT_MS);
  }, [finish, later, mode]);

  // Lifecycle: mark the session, schedule the timeline, listen for Escape and tab hide.
  useEffect(() => {
    ended.current = false; // dev StrictMode remounts after a simulated unmount
    markIntroSeen(window.sessionStorage);
    prevFocus.current = document.activeElement;
    const d = document.documentElement;
    // The splash is on screen: drop the pre-paint cover and take the page underneath out of the
    // tab order and the accessibility tree, so Tab and screen readers land on Skip.
    d.dataset.introLive = "1";
    inerted.current = holdPage(root.current);
    if (mode !== "static") {
      try {
        if (window.localStorage.getItem(SOUND_PREF_KEY) === "on") enableSound();
      } catch {
        /* private mode / storage disabled: fall back to the Sound button */
      }
    }
    if (mode === "static") later(() => finish(true), INTRO_STATIC_HOLD_MS);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") quickExit();
    };
    const onHide = () => {
      if (document.visibilityState === "hidden") {
        pauseAllSfx();
        finish(false);
      }
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", onHide);
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
      if (!ended.current) {
        ended.current = true;
        releasePage(inerted.current);
        endIntroAttributes();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once per splash
  }, []);

  // The CSS timeline starts at data-ready, so the wipe and the end are timed from there too: a slow
  // decode delays the whole sequence rather than cutting the loader short.
  useEffect(() => {
    if (!ready || ended.current) return;
    later(() => {
      document.documentElement.dataset.introPhase = "transition";
    }, INTRO_TRANSITION_AT);
    later(() => finish(true), INTRO_TOTAL_MS);
    if (mode !== "static") {
      // Matches app/styles/origami-beach.css: the plane's flight starts at ready, the loader's
      // four-icon hop wave lands at 2750/3000/3250/3500ms, and the wipe starts at INTRO_TRANSITION_AT.
      later(() => playSfx("swoosh"), 0);
      LOADER.forEach((_, i) => later(() => playSfx("tick"), 2750 + i * 250));
      later(() => playSfx("pageflip"), INTRO_TRANSITION_AT);
    }
  }, [ready, finish, later, mode, playSfx]);

  // The flight needs its plane and beach decoded before the plane is meant to be on screen; if they
  // miss that, go straight to the homepage rather than fly an empty sky.
  useEffect(() => {
    if (mode !== "play") return;
    let done = false;
    let dead = false;
    Promise.all(INTRO_FLIGHT_ASSETS.map(loadImage))
      .then(() => {
        if (dead) return;
        done = true;
        setReady(true);
      })
      .catch(() => {
        /* the deadline below handles it */
      });
    const deadline = window.setTimeout(() => {
      if (!done) quickExit();
    }, INTRO_ASSETS_AT);
    return () => {
      dead = true;
      window.clearTimeout(deadline);
    };
  }, [mode, quickExit]);

  return (
    <div
      ref={root}
      className="ob"
      data-mode={mode}
      data-theme-variant={theme}
      data-ready={ready || undefined}
      data-exiting={exiting || undefined}
      role="region"
      aria-label={`Welcome to ${site.name}'s portfolio`}
    >
      <div className="ob-beach" aria-hidden="true" />

      {mode === "play" && (
        <div className="ob-world" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element -- decorative sprite, decoded above */}
          <img className="ob-plane" src={`${ASSET_DIR}/plane.webp`} alt="" width={993} height={866} decoding="async" />
        </div>
      )}

      <div className="ob-stack">
        <div className="ob-brand">
          <span className="ob-logo" aria-hidden="true">
            <span className="ob-haze" />
            <Monogram className="ob-mark" />
          </span>
          <p className="ob-name">{site.name}</p>
          <p className="ob-tagline">
            Building ideas at the intersection
            <br />
            of AI, Products and People.
          </p>
        </div>

        <div className="ob-loader" role="status">
          <span className="ob-icons" aria-hidden="true">
            {LOADER.map((k, i) => (
              // eslint-disable-next-line @next/next/no-img-element -- 40 px decorative cut-outs
              <img key={k} className="ob-icon" src={`${ASSET_DIR}/${k}.webp`} alt="" style={{ "--i": i } as CSSProperties} />
            ))}
          </span>
          <span className="ob-loading">Loading my portfolio...</span>
        </div>
      </div>

      {mode !== "static" && (
        <button
          type="button"
          className="ob-sound"
          onClick={enableSound}
          aria-pressed={soundOn}
          disabled={soundOn}
        >
          {soundOn ? "Sound on" : "Sound"}
        </button>
      )}

      <button type="button" className="ob-skip" onClick={quickExit}>
        Skip intro
      </button>
    </div>
  );
}
