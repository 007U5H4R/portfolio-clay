/**
 * origami-bloom.test.ts (TASK-360, TASK-362 beach flight) — eligibility, storyboard timing and the inline pre-paint script of
 * the phone welcome splash, all against the one module the head script and the client share.
 */
import { describe, it, expect } from "vitest";
import {
  INTRO_ASSETS_AT,
  INTRO_FLIGHT_ASSETS,
  INTRO_DONE_EVENT,
  INTRO_FAILSAFE_MS,
  INTRO_FRAMES,
  INTRO_SESSION_KEY,
  INTRO_TOTAL_MS,
  INTRO_TRANSITION_AT,
  frameAt,
  introInitScript,
  introMode,
  markIntroSeen,
  type IntroEnv,
} from "@/lib/origami-bloom";

const eligible: IntroEnv = {
  pathname: "/",
  phone: true,
  webdriver: false,
  optIn: false,
  seen: false,
  reducedMotion: false,
};

describe("introMode — who sees the splash", () => {
  it("plays for a first visit to / on a phone", () => {
    expect(introMode(eligible)).toBe("play");
  });
  it("reduced motion gets the static frame instead of the animation", () => {
    expect(introMode({ ...eligible, reducedMotion: true })).toBe("static");
  });
  it("never shows off the homepage, on tablet/desktop, or once seen", () => {
    expect(introMode({ ...eligible, pathname: "/about" })).toBeNull();
    expect(introMode({ ...eligible, phone: false })).toBeNull();
    expect(introMode({ ...eligible, seen: true })).toBeNull();
  });
  it("skips when session storage is unreadable (cannot honour once per session)", () => {
    expect(introMode({ ...eligible, seen: null })).toBeNull();
  });
  it("skips automation unless the test opted in", () => {
    expect(introMode({ ...eligible, webdriver: true })).toBeNull();
    expect(introMode({ ...eligible, webdriver: true, optIn: true })).toBe("play");
  });
});

describe("storyboard timing", () => {
  it("frames are strictly increasing, start at 0 and end before the total", () => {
    expect(INTRO_FRAMES[0].at).toBe(0);
    for (let i = 1; i < INTRO_FRAMES.length; i++) expect(INTRO_FRAMES[i]!.at).toBeGreaterThan(INTRO_FRAMES[i - 1]!.at);
    expect(INTRO_FRAMES.at(-1)!.at).toBeLessThan(INTRO_TOTAL_MS);
  });
  it("matches the beach-flight storyboard and the ~4.4 s budget", () => {
    expect(INTRO_FRAMES.map((f) => f.id)).toEqual(["enter", "ascend", "logo", "name", "exit", "loader", "transition"]);
    expect(INTRO_TOTAL_MS).toBe(4450);
    expect(INTRO_TRANSITION_AT).toBe(INTRO_FRAMES.find((f) => f.id === "transition")!.at);
    expect(INTRO_ASSETS_AT).toBeLessThan(INTRO_FRAMES.find((f) => f.id === "logo")!.at);
  });
  it("frameAt maps a time to the beat that is playing", () => {
    expect(frameAt(0)).toBe("enter");
    expect(frameAt(499)).toBe("enter");
    expect(frameAt(500)).toBe("ascend");
    expect(frameAt(1500)).toBe("name");
    expect(frameAt(3000)).toBe("loader");
    expect(frameAt(5000)).toBe("transition");
  });
});

describe("markIntroSeen", () => {
  it("writes the session key and never throws", () => {
    const data = new Map<string, string>();
    markIntroSeen({ setItem: (k, v) => void data.set(k, v) });
    expect(data.get(INTRO_SESSION_KEY)).toBe("1");
    expect(() =>
      markIntroSeen({
        setItem: () => {
          throw new Error("denied");
        },
      }),
    ).not.toThrow();
    expect(() => markIntroSeen(undefined)).not.toThrow();
  });
});

describe("introInitScript (the inline pre-paint script)", () => {
  type Opts = {
    path?: string;
    phone?: boolean;
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
    const store = new Map<string, string>(o.seen ? [[INTRO_SESSION_KEY, "1"]] : []);
    const win = {
      __hsOrigamiIntro: o.optIn ? true : undefined,
      matchMedia: (q: string) => ({
        matches: q.includes("max-width") ? o.phone !== false : q.includes("reduce") ? !!o.reduced : false,
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
    new Function("document", "window", "location", "navigator", "setTimeout", "Event", introInitScript)(
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
    expect(run().dataset.intro).toBe("play");
    expect(run({ reduced: true }).dataset.intro).toBe("static");
  });
  it("leaves the page alone when not eligible", () => {
    for (const o of [{ path: "/work" }, { phone: false }, { seen: true }, { throwing: true }, { webdriver: true }]) {
      const r = run(o);
      expect(r.dataset.intro).toBeUndefined();
      expect(r.timers).toHaveLength(0);
    }
  });
  it("starts fetching the flight's plane and beach on a play visit only", () => {
    expect(run().fetched).toEqual([...INTRO_FLIGHT_ASSETS]);
    expect(run({ reduced: true }).fetched).toEqual([]);
    expect(run({ seen: true }).fetched).toEqual([]);
  });
  it("honours the automation opt-in", () => {
    expect(run({ webdriver: true, optIn: true }).dataset.intro).toBe("play");
  });
  it("never writes storage itself (the client marks the session once it takes over)", () => {
    expect(run().store.size).toBe(0);
  });
  it("failsafe: if the client never takes over, it clears the attribute and signals done", () => {
    const r = run();
    expect(r.timers).toHaveLength(1);
    expect(r.timers[0]!.ms).toBe(INTRO_FAILSAFE_MS);
    r.timers[0]!.fn();
    expect(r.dataset.intro).toBeUndefined();
    expect(r.events).toEqual([INTRO_DONE_EVENT]);
  });
  it("failsafe stands down once the client has claimed the intro", () => {
    const r = run();
    r.dataset.introClaimed = "1";
    r.timers[0]!.fn();
    expect(r.dataset.intro).toBe("play");
    expect(r.events).toEqual([]);
  });
});
