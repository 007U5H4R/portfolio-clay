"use client";

/**
 * OrigamiDesktop (TASK-365) — the ~3 s desktop welcome splash, loaded only by OrigamiDesktopGate when
 * the pre-paint script marked the visit eligible. A cobalt paper plane flies the full width of the
 * approved coastal plate, left to right; the moment it crosses the horizontal centre tears open a
 * paper reveal of the TP monogram, name, avatar and the phone splash's four-icon loader, a brief hold,
 * then the splash wipes away to the homepage underneath. Kept a fully separate module from the phone
 * splash (OrigamiBeach.tsx) so neither can regress the other's tests. No sound: the Sound button stays
 * phone-only.
 */
import "@/app/styles/origami-desktop.css";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { site } from "@/lib/site";
import {
  INTRO_DESKTOP_ASSETS_AT,
  INTRO_DESKTOP_FLIGHT_ASSETS,
  INTRO_DESKTOP_QUICK_EXIT_MS,
  INTRO_DESKTOP_STATIC_HOLD_MS,
  INTRO_DESKTOP_TOTAL_MS,
  INTRO_DESKTOP_TRANSITION_AT,
  markIntroDesktopSeen,
  type IntroDesktopMode,
} from "@/lib/origami-desktop";
import { endIntroDesktopAttributes } from "./OrigamiDesktopGate";

const PLANE_SRC = "/origami-beach/plane.webp";
const ENV_SRC = "/origami-desktop/env-coastal.webp";
const AVATAR_LIGHT = "/media/paper-world/hero-home/hero-home-subject.webp";
const AVATAR_DARK = "/media/paper-world/hero-home/hero-home-subject-dark.webp";
/** Reuses the phone splash's four-icon loader (OrigamiBeach.tsx) and its assets. */
const LOADER = ["boat", "star", "palm", "miniplane"] as const;

type Theme = "light" | "dark";

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

export function OrigamiDesktop({ mode, onDone }: { mode: IntroDesktopMode; onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const ended = useRef(false);
  const prevFocus = useRef<Element | null>(null);
  /** Page elements this splash made inert; released at the end. */
  const inerted = useRef<HTMLElement[]>([]);
  const [theme] = useState<Theme>(() => (document.documentElement.dataset.theme === "dark" ? "dark" : "light"));
  const [exiting, setExiting] = useState(false);
  const [ready, setReady] = useState(false);

  const finish = useCallback(
    (restoreFocus: boolean) => {
      if (ended.current) return;
      ended.current = true;
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
      const hadFocus = root.current?.contains(document.activeElement) ?? false;
      releasePage(inerted.current);
      endIntroDesktopAttributes();
      if (restoreFocus && hadFocus) {
        const prev = prevFocus.current;
        if (prev instanceof HTMLElement && prev.isConnected && prev !== document.body) prev.focus({ preventScroll: true });
        else (document.activeElement as HTMLElement | null)?.blur();
      }
      onDone();
    },
    [onDone],
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
    later(() => finish(true), mode === "static" ? 0 : INTRO_DESKTOP_QUICK_EXIT_MS);
  }, [finish, later, mode]);

  // Lifecycle: mark the session, schedule the timeline, listen for Escape and tab hide.
  useEffect(() => {
    ended.current = false; // dev StrictMode remounts after a simulated unmount
    markIntroDesktopSeen(window.sessionStorage);
    prevFocus.current = document.activeElement;
    const d = document.documentElement;
    // The splash is on screen: drop the pre-paint cover and take the page underneath out of the
    // tab order and the accessibility tree, so Tab and screen readers land on Skip.
    d.dataset.introDesktopLive = "1";
    inerted.current = holdPage(root.current);
    if (mode === "static") later(() => finish(true), INTRO_DESKTOP_STATIC_HOLD_MS);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") quickExit();
    };
    const onHide = () => {
      if (document.visibilityState === "hidden") finish(false);
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
        endIntroDesktopAttributes();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once per splash
  }, []);

  // The CSS timeline starts at data-ready, so the wipe and the end are timed from there too: a slow
  // decode delays the whole sequence rather than cutting the reveal short.
  useEffect(() => {
    if (!ready || ended.current) return;
    later(() => {
      document.documentElement.dataset.introDesktopPhase = "transition";
    }, INTRO_DESKTOP_TRANSITION_AT);
    later(() => finish(true), INTRO_DESKTOP_TOTAL_MS);
  }, [ready, finish, later]);

  // The flight needs its plate, plane and avatar decoded before they're meant to be on screen; if
  // they miss that, go straight to the homepage rather than fly an empty plate.
  useEffect(() => {
    if (mode !== "play") return;
    let done = false;
    let dead = false;
    const avatarSrc = theme === "dark" ? INTRO_DESKTOP_FLIGHT_ASSETS[2] : INTRO_DESKTOP_FLIGHT_ASSETS[1];
    Promise.all([INTRO_DESKTOP_FLIGHT_ASSETS[0], avatarSrc, PLANE_SRC].map(loadImage))
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
    }, INTRO_DESKTOP_ASSETS_AT);
    return () => {
      dead = true;
      window.clearTimeout(deadline);
    };
  }, [mode, theme, quickExit]);

  const avatarSrc = theme === "dark" ? AVATAR_DARK : AVATAR_LIGHT;

  return (
    <div
      ref={root}
      className="od"
      data-mode={mode}
      data-theme-variant={theme}
      data-ready={ready || undefined}
      data-exiting={exiting || undefined}
      role="region"
      aria-label={`Welcome to ${site.name}'s portfolio`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative plate, decoded above */}
      <img className="od-env" src={ENV_SRC} alt="" aria-hidden="true" width={1344} height={752} decoding="async" />

      {mode === "play" && (
        <div className="od-world" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element -- decorative sprite, decoded above */}
          <img className="od-plane" src={PLANE_SRC} alt="" width={993} height={866} decoding="async" />
        </div>
      )}

      <div className="od-stack">
        <div className="od-brand">
          <span className="od-logo" aria-hidden="true">
            <span className="od-haze" />
            <Monogram className="od-mark" />
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element -- decorative avatar, decoded above */}
          <img className="od-avatar" src={avatarSrc} alt="" aria-hidden="true" decoding="async" />
          <p className="od-name">{site.name}</p>
        </div>
        <div className="od-loader" role="status">
          <span className="od-icons" aria-hidden="true">
            {LOADER.map((k, i) => (
              // eslint-disable-next-line @next/next/no-img-element -- 40 px decorative cut-outs
              <img key={k} className="od-icon" src={`/origami-beach/${k}.webp`} alt="" style={{ "--i": i } as CSSProperties} />
            ))}
          </span>
          <span className="od-loading">Loading my portfolio...</span>
        </div>
      </div>

      <button type="button" className="od-skip" onClick={quickExit}>
        Skip intro
      </button>
    </div>
  );
}
