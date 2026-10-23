"use client";

/**
 * The Origami Bloom (TASK-360) — the ~3.1 s phone welcome splash, loaded only by OrigamiBloomGate when
 * the pre-paint script marked the visit eligible. The bloom is hinged CSS-3D paper (no images); the
 * landscape is drawn onto <canvas> layers so none of it can become the page's LCP element (the hero
 * image underneath stays the LCP). Timing lives in CSS keyframes keyed to INTRO_FRAMES; this file owns
 * the lifecycle: world loading and its deadline, Skip / Escape / CTA, tab hide, the end signal.
 */
import "@/app/styles/origami-bloom.css";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { scrollToTarget } from "@/lib/smooth-scroll";
import { site } from "@/lib/site";
import {
  INTRO_QUICK_EXIT_MS,
  INTRO_STATIC_HOLD_MS,
  INTRO_TOTAL_MS,
  INTRO_TRANSITION_AT,
  INTRO_WORLD_AT,
  INTRO_WORLD_FETCH_AT,
  markIntroSeen,
  type IntroMode,
} from "@/lib/origami-bloom";
import { endIntroAttributes } from "./OrigamiBloomGate";

/** The homepage's existing work section (components/home/HomeSections.tsx). */
export const INTRO_CTA_TARGET_ID = "selected-work";

const ASSET_DIR = "/origami-bloom";
const OUTER = 8;
const INNER = 8;

type Theme = "light" | "dark";
type Layer = "plate" | "fg" | "dog" | "plane" | "cloudA" | "cloudB";

function assetUrls(theme: Theme, wide: boolean): Record<Layer, string> {
  const w = wide ? 900 : 640;
  return {
    plate: `${ASSET_DIR}/plate-${theme}-${w}.webp`,
    fg: `${ASSET_DIR}/fg-${w}.webp`,
    dog: `${ASSET_DIR}/dog-320.webp`,
    plane: `${ASSET_DIR}/plane-200.webp`,
    cloudA: `${ASSET_DIR}/cloud-a-380.webp`,
    cloudB: `${ASSET_DIR}/cloud-b-320.webp`,
  };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.decoding = "async";
  (img as HTMLImageElement & { fetchPriority?: string }).fetchPriority = "low";
  img.src = src;
  return img.decode().then(() => img);
}

/** Draw `img` into `canvas` at device resolution: cover-fit, anchored by `alignY` (0 top … 1 bottom). */
function paint(canvas: HTMLCanvasElement | null, img: HTMLImageElement, fit: "cover" | "contain", alignY = 0.5) {
  if (!canvas) return;
  // Layout size, not the bounding box: the layers are mid-transform (scale / translate) when painted.
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const cw = Math.max(1, Math.round(canvas.clientWidth * dpr));
  const ch = Math.max(1, Math.round(canvas.clientHeight * dpr));
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const scale = fit === "cover" ? Math.max(cw / img.naturalWidth, ch / img.naturalHeight) : Math.min(cw / img.naturalWidth, ch / img.naturalHeight);
  const w = img.naturalWidth * scale;
  const h = img.naturalHeight * scale;
  ctx.drawImage(img, (cw - w) / 2, (ch - h) * alignY, w, h);
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

export function OrigamiBloom({ mode, onDone }: { mode: IntroMode; onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const ended = useRef(false);
  const prevFocus = useRef<Element | null>(null);
  /** Page elements this splash made inert; released at the end. */
  const inerted = useRef<HTMLElement[]>([]);
  const [theme] = useState<Theme>(() => (document.documentElement.dataset.theme === "dark" ? "dark" : "light"));
  const [exiting, setExiting] = useState(false);
  const [world, setWorld] = useState<"loading" | "ready">("loading");

  const finish = useCallback(
    (restoreFocus: boolean) => {
      if (ended.current) return;
      ended.current = true;
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
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
    [onDone],
  );

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  /** Skip / Escape / missed world deadline: a short fade, then the homepage. */
  const quickExit = useCallback(() => {
    if (ended.current) return;
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    setExiting(true);
    later(() => finish(true), mode === "static" ? 0 : INTRO_QUICK_EXIT_MS);
  }, [finish, later, mode]);

  const explore = useCallback(() => {
    finish(false);
    const target = document.getElementById(INTRO_CTA_TARGET_ID);
    if (!target) return;
    // Same path as HeroExploreLink: Lenis when mounted, else a native scroll clear of the sticky header.
    if (scrollToTarget(target)) return;
    const header = document.querySelector<HTMLElement>("header[data-site-header]");
    const top = target.getBoundingClientRect().top + window.scrollY - (header?.getBoundingClientRect().height ?? 0);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: Math.max(0, top), behavior: reduced ? "instant" : "smooth" });
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  }, [finish]);

  // Lifecycle: mark the session, schedule the timeline, listen for Escape and tab hide.
  useEffect(() => {
    markIntroSeen(window.sessionStorage);
    prevFocus.current = document.activeElement;
    const d = document.documentElement;
    // The splash is on screen: drop the pre-paint cover and take the page underneath out of the
    // tab order and the accessibility tree, so Tab and screen readers land on Skip.
    d.dataset.introLive = "1";
    inerted.current = holdPage(root.current);
    if (mode === "static") {
      later(() => finish(true), INTRO_STATIC_HOLD_MS);
    } else {
      later(() => {
        d.dataset.introPhase = "transition";
      }, INTRO_TRANSITION_AT);
      later(() => finish(true), INTRO_TOTAL_MS);
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") quickExit();
    };
    const onHide = () => {
      if (document.visibilityState === "hidden") finish(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("visibilitychange", onHide);
    const pending = timers.current;
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", onHide);
      pending.forEach((t) => window.clearTimeout(t));
      if (!ended.current) {
        ended.current = true;
        releasePage(inerted.current);
        endIntroAttributes();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once per splash
  }, []);

  // The world: fetch after the bloom has started, draw to canvas, and give up if it misses its frame.
  useEffect(() => {
    if (mode !== "play") return;
    let ready = false;
    let dead = false;
    const wide = window.innerWidth * Math.min(window.devicePixelRatio || 1, 2) > 640;
    const urls = assetUrls(theme, wide);
    const start = window.setTimeout(() => {
      const layers = Object.keys(urls) as Layer[];
      Promise.all(layers.map((k) => loadImage(urls[k])))
        .then((imgs) => {
          if (dead) return;
          const by = Object.fromEntries(layers.map((k, i) => [k, imgs[i]])) as Record<Layer, HTMLImageElement>;
          const c = (k: Layer) => root.current?.querySelector<HTMLCanvasElement>(`canvas[data-layer="${k}"]`) ?? null;
          paint(c("plate"), by.plate, "cover", 0.5);
          paint(c("fg"), by.fg, "cover", 1);
          for (const k of ["dog", "plane", "cloudA", "cloudB"] as const) paint(c(k), by[k], "contain", 1);
          ready = true;
          setWorld("ready");
        })
        .catch(() => {
          /* the deadline below handles it */
        });
    }, INTRO_WORLD_FETCH_AT);
    const deadline = window.setTimeout(() => {
      if (!ready) quickExit();
    }, INTRO_WORLD_AT);
    return () => {
      dead = true;
      window.clearTimeout(start);
      window.clearTimeout(deadline);
    };
  }, [mode, theme, quickExit]);

  return (
    <div
      ref={root}
      className="ob"
      data-mode={mode}
      data-theme-variant={theme}
      data-world={world}
      data-exiting={exiting || undefined}
      role="region"
      aria-label={`Welcome to ${site.name}'s portfolio`}
    >
      <button type="button" className="ob-skip" onClick={quickExit}>
        Skip intro
      </button>

      {mode === "play" && (
        <div className="ob-world" aria-hidden="true">
          <canvas data-layer="plate" className="ob-layer ob-plate" />
          <canvas data-layer="cloudA" className="ob-sprite ob-cloud-a" />
          <canvas data-layer="cloudB" className="ob-sprite ob-cloud-b" />
          <canvas data-layer="plane" className="ob-sprite ob-plane" />
          <svg className="ob-trail" viewBox="0 0 200 80" preserveAspectRatio="none">
            <path d="M4 76 C 90 76, 150 60, 196 4" pathLength={1} />
          </svg>
          <canvas data-layer="fg" className="ob-layer ob-fg" />
          <canvas data-layer="dog" className="ob-sprite ob-dog" />
        </div>
      )}

      {mode === "play" && (
        <div className="ob-sig" aria-hidden="true">
          <svg className="ob-sig-ink" viewBox="0 0 200 200">
            <g transform="translate(52 34) scale(2.4)">
              <path pathLength={1} d="M6 9 C 14 7, 22 8, 30 7" strokeWidth="2.4" />
              <path pathLength={1} d="M17 8 C 15 16, 13 24, 12 33" strokeWidth="2.4" />
              <path pathLength={1} d="M23 12 C 24 20, 22 27, 21 33" strokeWidth="2.2" />
              <path pathLength={1} d="M23 12 C 30 10, 35 13, 34 18 C 33 23, 27 24, 22 22" strokeWidth="2.2" />
            </g>
            <path className="ob-sig-line" pathLength={1} d="M58 150 C 88 145, 118 151, 144 144" strokeWidth="3" />
          </svg>
        </div>
      )}

      <div className="ob-stage" aria-hidden="true">
        {mode === "play" &&
          [0, 1, 2, 3].map((i) => <span key={`s${i}`} className="ob-sliver" style={{ "--i": i } as CSSProperties} />)}
        <div className="ob-flower">
          {Array.from({ length: OUTER }, (_, i) => (
            <span key={`o${i}`} className="ob-hinge ob-outer" style={{ "--i": i, "--a": `${(360 / OUTER) * i}deg` } as CSSProperties}>
              <span className="ob-petal" />
            </span>
          ))}
          {Array.from({ length: INNER }, (_, i) => (
            <span
              key={`n${i}`}
              className="ob-hinge ob-inner"
              style={{ "--i": i, "--a": `${(360 / INNER) * i + 180 / INNER}deg` } as CSSProperties}
            >
              <span className="ob-petal" />
            </span>
          ))}
        </div>
        <span className="ob-core">
          <Monogram className="ob-core-mark" />
          <span className="ob-sweep" />
        </span>
      </div>

      <div className="ob-copy" aria-hidden="true">
        <p className="ob-name">{site.name}</p>
        <p className="ob-tagline">Building ideas at the intersection of AI, Products and People.</p>
      </div>

      <a
        className="ob-cta"
        href={`#${INTRO_CTA_TARGET_ID}`}
        onClick={(e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
          e.preventDefault();
          explore();
        }}
      >
        <span>Explore my work</span>
        <span className="ob-cta-fold" aria-hidden="true">
          →
        </span>
      </a>
    </div>
  );
}
