/**
 * origami-desktop.test.ts (TASK-365) — eligibility, storyboard timing and the inline pre-paint script of
 * the desktop welcome splash, all against the one module the head script and the client share. Mirrors
 * tests/unit/origami-bloom.test.ts's structure for the fully separate desktop module.
 */
import { describe, it, expect } from "vitest";
import {
  INTRO_DESKTOP_ASSETS_AT,
  INTRO_DESKTOP_FLIGHT_ASSETS,
  INTRO_DESKTOP_DONE_EVENT,
  INTRO_DESKTOP_FAILSAFE_MS,
  INTRO_DESKTOP_FRAMES,
  INTRO_DESKTOP_SESSION_KEY,
  INTRO_DESKTOP_TOTAL_MS,
  INTRO_DESKTOP_TRANSITION_AT,
  frameAtDesktop,
  introDesktopInitScript,
  introDesktopMode,
  markIntroDesktopSeen,
  type IntroDesktopEnv,
} from "@/lib/origami-desktop";

const eligible: IntroDesktopEnv = {
  pathname: "/",
  desktop: true,
  webdriver: false,
  optIn: false,
  seen: false,
  reducedMotion: false,
};

describe("introDesktopMode — who sees the splash", () => {
  it("plays for a first visit to / on desktop", () => {
    expect(introDesktopMode(eligible)).toBe("play");
  });
  it("reduced motion gets the static frame instead of the animation", () => {
    expect(introDesktopMode({ ...eligible, reducedMotion: true })).toBe("static");
  });
  it("never shows off the homepage, on phone/tablet, or once seen", () => {
    expect(introDesktopMode({ ...eligible, pathname: "/about" })).toBeNull();
    expect(introDesktopMode({ ...eligible, desktop: false })).toBeNull();
    expect(introDesktopMode({ ...eligible, seen: true })).toBeNull();
  });
  it("skips when session storage is unreadable (cannot honour once per session)", () => {
    expect(introDesktopMode({ ...eligible, seen: null })).toBeNull();
  });
  it("skips automation unless the test opted in", () => {
    expect(introDesktopMode({ ...eligible, webdriver: true })).toBeNull();
    expect(introDesktopMode({ ...eligible, webdriver: true, optIn: true })).toBe("play");
  });
});

describe("storyboard timing", () => {
  it("frames are strictly increasing, start at 0 and end before the total", () => {
    expect(INTRO_DESKTOP_FRAMES[0].at).toBe(0);
    for (let i = 1; i < INTRO_DESKTOP_FRAMES.length; i++)
      expect(INTRO_DESKTOP_FRAMES[i]!.at).toBeGreaterThan(INTRO_DESKTOP_FRAMES[i - 1]!.at);
    expect(INTRO_DESKTOP_FRAMES.at(-1)!.at).toBeLessThan(INTRO_DESKTOP_TOTAL_MS);
  });
  it("matches the plane-reveal storyboard and the ~3 s budget", () => {
    expect(INTRO_DESKTOP_FRAMES.map((f) => f.id)).toEqual(["enter", "reveal", "name", "hold", "transition"]);
    expect(INTRO_DESKTOP_TOTAL_MS).toBe(3000);
    expect(INTRO_DESKTOP_TRANSITION_AT).toBe(INTRO_DESKTOP_FRAMES.find((f) => f.id === "transition")!.at);
    expect(INTRO_DESKTOP_ASSETS_AT).toBeLessThan(INTRO_DESKTOP_FRAMES.find((f) => f.id === "reveal")!.at);
  });
  it("frameAtDesktop maps a time to the beat that is playing", () => {
    expect(frameAtDesktop(0)).toBe("enter");
    expect(frameAtDesktop(799)).toBe("enter");
    expect(frameAtDesktop(800)).toBe("reveal");
    expect(frameAtDesktop(1200)).toBe("name");
    expect(frameAtDesktop(1800)).toBe("hold");
    expect(frameAtDesktop(2700)).toBe("transition");
  });
});

describe("markIntroDesktopSeen", () => {
  it("writes the session key and never throws", () => {
    const data = new Map<string, string>();
    markIntroDesktopSeen({ setItem: (k, v) => void data.set(k, v) });
    expect(data.get(INTRO_DESKTOP_SESSION_KEY)).toBe("1");
    expect(() =>
      markIntroDesktopSeen({
        setItem: () => {
          throw new Error("denied");
        },
      }),
    ).not.toThrow();
    expect(() => markIntroDesktopSeen(undefined)).not.toThrow();
  });
});

describe("introDesktopInitScript (the inline pre-paint script)", () => {
  type Opts = {
    path?: string;
    desktop?: boolean;
    reduced?: boolean;
    webdriver?: boolean;
    optIn?: boolean;
    seen?: boolean;
    throwing?: boolean;
  };
  function run(o: Opts = {}) {
    const dataset: Record<string, string> = {};
    const timers: Array<{ fn: () => void; ms: number }> = [];
    const events: string[] = [];
    const fetched: string[] = [];
    const store = new Map<string, string>(o.seen ? [[INTRO_DESKTOP_SESSION_KEY, "1"]] : []);
    const win = {
      __hsOrigamiDesktopIntro: o.optIn ? true : undefined,
      matchMedia: (q: string) => ({
        matches: q.includes("min-width") ? o.desktop !== false : q.includes("reduce") ? !!o.reduced : false,
      }),
      sessionStorage: {
        getItem: (k: string) => {
          if (o.throwing) throw new Error("denied");
          return store.get(k) ?? null;
        },
      },
      dispatchEvent: (e: { type: string }) => events.push(e.type),
      Image: class {
        set src(u: string) {
          fetched.push(u);
        }
      },
    };
    const doc = { documentElement: { dataset } };
    class FakeEvent {
      constructor(public type: string) {}
    }
    new Function("document", "window", "location", "navigator", "setTimeout", "Event", introDesktopInitScript)(
      doc,
      win,
      { pathname: o.path ?? "/" },
      { webdriver: !!o.webdriver },
      (fn: () => void, ms: number) => timers.push({ fn, ms }),
      FakeEvent,
    );
    return { dataset, timers, events, store, fetched };
  }

  it("marks an eligible visit play, or static under reduced motion", () => {
    expect(run().dataset.introDesktop).toBe("play");
    expect(run({ reduced: true }).dataset.introDesktop).toBe("static");
  });
  it("leaves the page alone when not eligible", () => {
    for (const o of [{ path: "/work" }, { desktop: false }, { seen: true }, { throwing: true }, { webdriver: true }]) {
      const r = run(o);
      expect(r.dataset.introDesktop).toBeUndefined();
      expect(r.timers).toHaveLength(0);
    }
  });
  it("starts fetching the plate and avatars on a play visit only", () => {
    expect(run().fetched).toEqual([...INTRO_DESKTOP_FLIGHT_ASSETS]);
    expect(run({ reduced: true }).fetched).toEqual([]);
    expect(run({ seen: true }).fetched).toEqual([]);
  });
  it("honours the automation opt-in", () => {
    expect(run({ webdriver: true, optIn: true }).dataset.introDesktop).toBe("play");
  });
  it("never writes storage itself (the client marks the session once it takes over)", () => {
    expect(run().store.size).toBe(0);
  });
  it("failsafe: if the client never takes over, it clears the attribute and signals done", () => {
    const r = run();
    expect(r.timers).toHaveLength(1);
    expect(r.timers[0]!.ms).toBe(INTRO_DESKTOP_FAILSAFE_MS);
    r.timers[0]!.fn();
    expect(r.dataset.introDesktop).toBeUndefined();
    expect(r.events).toEqual([INTRO_DESKTOP_DONE_EVENT]);
  });
  it("failsafe stands down once the client has claimed the intro", () => {
    const r = run();
    r.dataset.introDesktopClaimed = "1";
    r.timers[0]!.fn();
    expect(r.dataset.introDesktop).toBe("play");
    expect(r.events).toEqual([]);
  });
});
