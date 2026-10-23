/**
 * Phone welcome splash contract (TASK-360, rebuilt as Origami Beach Flight in TASK-362) — the ONE module
 * behind the splash's pre-paint script, its client lifecycle and its tests. The splash is a ~4.4 s overlay on `/` for phones only
 * (<640 px); the server-rendered homepage stays underneath and is the LCP element.
 *
 * Eligibility (all must hold): path is `/`, viewport is a phone, the visitor has not seen it this
 * session, and the browser is not automated (`navigator.webdriver`) unless a test opts in with
 * `window.__hsOrigamiIntro = true` before load (same pattern as MobileCarousel's autoplay opt-in).
 *
 * Attributes on <html>, in order:
 *   - `data-intro="play|static"`: set by the inline script before first paint. It shows a CSS cover
 *     (the splash's opening frame) and locks page scroll.
 *   - `data-intro-claimed`: set by OrigamiBloomGate on hydration. It stands the head script's failsafe
 *     down; the gate then gives the splash chunk INTRO_CHUNK_BUDGET_MS to arrive.
 *   - `data-intro-live`: set by OrigamiBeach when it mounts. Only then does the cover drop, so the
 *     homepage never flashes between the cover and the splash.
 * Hard cap on the cover with no splash: the client must claim within INTRO_FAILSAFE_MS of the head
 * script, then the chunk must arrive within INTRO_CHUNK_BUDGET_MS, so at most ~2.1 s.
 *
 * Ending (played, skipped, failed or late chunk, the gate unmounting mid-load, the failsafe)
 * always removes every attribute. `hs:intro-done` is dispatched on window when an intro that was
 * marked actually ends; it never fires on visits that had no intro. A consumer that waits for it
 * must first check `document.documentElement.dataset.intro`: if that is absent, there is nothing to
 * wait for (no intro this visit, or it already ended).
 */

export const INTRO_SESSION_KEY = "hs-origami-intro";
export const INTRO_DONE_EVENT = "hs:intro-done";
export const INTRO_PHONE_QUERY = "(max-width: 639.98px)";
/** Hard cap from the head script to the client splash taking over; past it the homepage shows. */
export const INTRO_FAILSAFE_MS = 1200;
/** Once the client has claimed the intro, how long the splash chunk has to arrive before the homepage shows. */
export const INTRO_CHUNK_BUDGET_MS = 900;
/** Reduced motion: the static frame is held this long, then removed without animation. */
export const INTRO_STATIC_HOLD_MS = 1500;

export type IntroMode = "play" | "static";

export interface IntroEnv {
  pathname: string;
  phone: boolean;
  webdriver: boolean;
  optIn: boolean;
  /** null when session storage is unreadable — then we cannot honour once-per-session, so skip. */
  seen: boolean | null;
  reducedMotion: boolean;
}

export function introMode(env: IntroEnv): IntroMode | null {
  if (env.pathname !== "/") return null;
  if (!env.phone) return null;
  if (env.webdriver && !env.optIn) return null;
  if (env.seen !== false) return null;
  return env.reducedMotion ? "static" : "play";
}

/** Storyboard frames (TASK-362 Origami Beach Flight), start times in ms. */
export const INTRO_FRAMES = [
  { id: "enter", at: 0 },
  { id: "ascend", at: 500 },
  { id: "logo", at: 1150 },
  { id: "name", at: 1500 },
  { id: "exit", at: 2000 },
  { id: "loader", at: 2700 },
  { id: "transition", at: 4200 },
] as const;

export type IntroFrame = (typeof INTRO_FRAMES)[number]["id"];

/** The plane and the beach must be decoded by now; if they are not, the splash ends early (quick exit). */
export const INTRO_ASSETS_AT = 600;

/** The flight's two must-have images. The pre-paint script starts fetching them on an eligible play
 * visit, so they are usually decoded by the time the splash chunk mounts. */
export const INTRO_FLIGHT_ASSETS = ["/origami-beach/plane.webp", "/origami-beach/beach.webp"] as const;
export const INTRO_TRANSITION_AT = 4200;
export const INTRO_TOTAL_MS = 4450;
/** Short fade used when the assets are late or the visitor skips. */
export const INTRO_QUICK_EXIT_MS = 250;

export function frameAt(ms: number): IntroFrame {
  let current: IntroFrame = INTRO_FRAMES[0].id;
  for (const f of INTRO_FRAMES) if (ms >= f.at) current = f.id;
  return current;
}

export function markIntroSeen(store: Pick<Storage, "setItem"> | undefined | null): void {
  try {
    store?.setItem(INTRO_SESSION_KEY, "1");
  } catch {
    /* unwritable storage: the head script already skips when storage is unreadable */
  }
}

/**
 * The inline pre-paint script, placed right after the theme script. Mirrors `introMode`; never writes
 * storage (the client marks the session seen once the splash mounts). tests/unit/origami-bloom
 * runs it against fakes.
 */
export const introInitScript =
  `try{var d=document.documentElement,w=window;` +
  `if(location.pathname==="/"&&w.matchMedia("${INTRO_PHONE_QUERY}").matches&&(!navigator.webdriver||w.__hsOrigamiIntro===true)){` +
  `var s="1";try{s=w.sessionStorage.getItem("${INTRO_SESSION_KEY}")}catch(e){}` +
  `if(s===null){d.dataset.intro=w.matchMedia("(prefers-reduced-motion: reduce)").matches?"static":"play";` +
  `if(d.dataset.intro==="play"&&w.Image)${JSON.stringify(INTRO_FLIGHT_ASSETS)}.forEach(function(u){new w.Image().src=u});` +
  `setTimeout(function(){if(d.dataset.intro&&!d.dataset.introClaimed){delete d.dataset.intro;` +
  `w.dispatchEvent(new Event("${INTRO_DONE_EVENT}"))}},${INTRO_FAILSAFE_MS})}}}catch(e){}`;
