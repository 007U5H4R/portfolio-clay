/**
 * Desktop welcome splash contract (TASK-365) — a ~3 s overlay on `/` for desktop viewports (>=1024 px)
 * only, built as a fully separate module from the phone splash (`lib/origami-bloom.ts`) so neither can
 * regress the other's tests. A cobalt paper plane flies the full width of the screen, left to right;
 * the moment it crosses the horizontal centre tears open a paper reveal of the TP monogram, name
 * and the phone splash's four-icon loader; a brief hold; then the splash wipes away to the
 * homepage underneath (the real LCP element). No sound: the Sound button stays phone-only.
 *
 * Eligibility (all must hold): path is `/`, viewport is desktop (DESKTOP_QUERY, >=1024 px), the visitor
 * has not seen it this session, and the browser is not automated (`navigator.webdriver`) unless a test
 * opts in with `window.__hsOrigamiDesktopIntro = true` before load.
 *
 * Attributes on <html>, in order (own namespace, never touches the phone splash's `data-intro*`):
 *   - `data-intro-desktop="play|static"`: set by the inline script before first paint.
 *   - `data-intro-desktop-claimed`: set by OrigamiDesktopGate on hydration.
 *   - `data-intro-desktop-live`: set by OrigamiDesktop when it mounts.
 * Hard cap on the cover with no splash: INTRO_DESKTOP_FAILSAFE_MS + INTRO_DESKTOP_CHUNK_BUDGET_MS.
 *
 * Ending always removes every `data-intro-desktop*` attribute. `hs:intro-desktop-done` is dispatched on
 * window when a marked intro actually ends.
 */

export const INTRO_DESKTOP_SESSION_KEY = "hs-origami-desktop-intro";
export const INTRO_DESKTOP_DONE_EVENT = "hs:intro-desktop-done";
export const INTRO_DESKTOP_QUERY = "(min-width: 1024px)";
/** Hard cap from the head script to the client splash taking over; past it the homepage shows. */
export const INTRO_DESKTOP_FAILSAFE_MS = 1000;
/** Once the client has claimed the intro, how long the splash chunk has to arrive before the homepage shows. */
export const INTRO_DESKTOP_CHUNK_BUDGET_MS = 800;
/** Reduced motion: the static frame is held this long, then removed without animation. */
export const INTRO_DESKTOP_STATIC_HOLD_MS = 1200;

export type IntroDesktopMode = "play" | "static";

export interface IntroDesktopEnv {
  pathname: string;
  desktop: boolean;
  webdriver: boolean;
  optIn: boolean;
  /** null when session storage is unreadable — then we cannot honour once-per-session, so skip. */
  seen: boolean | null;
  reducedMotion: boolean;
}

export function introDesktopMode(env: IntroDesktopEnv): IntroDesktopMode | null {
  if (env.pathname !== "/") return null;
  if (!env.desktop) return null;
  if (env.webdriver && !env.optIn) return null;
  if (env.seen !== false) return null;
  return env.reducedMotion ? "static" : "play";
}

/** Storyboard frames (TASK-365), start times in ms. "reveal" is the plane's horizontal-centre crossing. */
export const INTRO_DESKTOP_FRAMES = [
  { id: "enter", at: 0 },
  { id: "reveal", at: 800 },
  { id: "name", at: 1200 },
  { id: "hold", at: 1800 },
  { id: "transition", at: 2700 },
] as const;

export type IntroDesktopFrame = (typeof INTRO_DESKTOP_FRAMES)[number]["id"];

/** The plate and avatar must be decoded by now; if not, the splash ends early (quick exit). */
export const INTRO_DESKTOP_ASSETS_AT = 500;

/** The flight's must-have images. The pre-paint script starts fetching them on an eligible play visit. */
export const INTRO_DESKTOP_FLIGHT_ASSETS = [
  "/origami-desktop/env-coastal.webp",
  "/media/paper-world/hero-home/hero-home-subject.webp",
  "/media/paper-world/hero-home/hero-home-subject-dark.webp",
] as const;
export const INTRO_DESKTOP_TRANSITION_AT = 2700;
export const INTRO_DESKTOP_TOTAL_MS = 3000;
/** Short fade used when the assets are late or the visitor skips. */
export const INTRO_DESKTOP_QUICK_EXIT_MS = 200;

export function frameAtDesktop(ms: number): IntroDesktopFrame {
  let current: IntroDesktopFrame = INTRO_DESKTOP_FRAMES[0].id;
  for (const f of INTRO_DESKTOP_FRAMES) if (ms >= f.at) current = f.id;
  return current;
}

export function markIntroDesktopSeen(store: Pick<Storage, "setItem"> | undefined | null): void {
  try {
    store?.setItem(INTRO_DESKTOP_SESSION_KEY, "1");
  } catch {
    /* unwritable storage: the head script already skips when storage is unreadable */
  }
}

/**
 * The inline pre-paint script, placed right after the phone splash's `introInitScript`. Mirrors
 * `introDesktopMode`; never writes storage (the client marks the session seen once the splash mounts).
 */
export const introDesktopInitScript =
  `try{var d=document.documentElement,w=window;` +
  `if(location.pathname==="/"&&w.matchMedia("${INTRO_DESKTOP_QUERY}").matches&&(!navigator.webdriver||w.__hsOrigamiDesktopIntro===true)){` +
  `var s="1";try{s=w.sessionStorage.getItem("${INTRO_DESKTOP_SESSION_KEY}")}catch(e){}` +
  `if(s===null){d.dataset.introDesktop=w.matchMedia("(prefers-reduced-motion: reduce)").matches?"static":"play";` +
  `if(d.dataset.introDesktop==="play"&&w.Image)${JSON.stringify(INTRO_DESKTOP_FLIGHT_ASSETS)}.forEach(function(u){new w.Image().src=u});` +
  `setTimeout(function(){if(d.dataset.introDesktop&&!d.dataset.introDesktopClaimed){delete d.dataset.introDesktop;` +
  `w.dispatchEvent(new Event("${INTRO_DESKTOP_DONE_EVENT}"))}},${INTRO_DESKTOP_FAILSAFE_MS})}}}catch(e){}`;
