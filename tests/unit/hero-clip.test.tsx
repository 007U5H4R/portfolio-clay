import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { render, waitFor } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { HeroClip } from "@/components/hero/HeroClip";
import { BANNER_SIZE, CLIP_PLACEMENT, CLIP_REGISTRATION, CLIP_SIZE, clipSlotStyle } from "@/components/hero/registration";

/**
 * `HeroClip` state machine (TSK-37 · technical-plan.md S73.05; decision TP13; Design.md §5.3;
 * TC-140 step 5, TC-141 steps 5–6). jsdom cannot play media, so `HTMLMediaElement.prototype.play`
 * is stubbed per case: resolving (default mode mounts and keeps the video) or rejecting (autoplay
 * policy → the video unmounts and the poster shows).
 */

const PROPS = {
  poster: "/media/illustrations/hero-poster.webp",
  webm: "/media/illustrations/hero-animation.webm",
  mp4: "/media/illustrations/hero-animation.mp4",
};

type Signals = { reducedMotion?: boolean; coarse?: boolean; saveData?: boolean };

/** `matchMedia` answering the two queries HeroClip asks, plus `navigator.connection`. */
function mockSignals({ reducedMotion = false, coarse = false, saveData }: Signals) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("prefers-reduced-motion") ? reducedMotion : query.includes("pointer: coarse") ? coarse : false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
  Object.defineProperty(navigator, "connection", {
    configurable: true,
    value: saveData === undefined ? undefined : { saveData },
  });
}

let play: ReturnType<typeof vi.fn>;

beforeEach(() => {
  play = vi.fn(() => Promise.resolve());
  Object.defineProperty(HTMLMediaElement.prototype, "play", { configurable: true, value: play });
});

afterEach(() => {
  vi.unstubAllGlobals();
  Reflect.deleteProperty(navigator, "connection");
});

const video = (container: HTMLElement) => container.querySelector("video");

describe("HeroClip (TP13 · Design.md §5.3)", () => {
  it("renders nothing on the server — the SSR HTML never carries a <video> (D10)", () => {
    expect(renderToStaticMarkup(<HeroClip {...PROPS} />)).toBe("");
  });

  it("default mode: mounts the exact <video> contract and calls play() once", async () => {
    mockSignals({});
    const { container } = render(<HeroClip {...PROPS} />);
    await waitFor(() => expect(video(container)).not.toBeNull());
    const v = video(container)!;

    expect(v).toHaveAttribute("autoplay");
    expect(v).toHaveAttribute("playsinline");
    expect(v).toHaveAttribute("preload", "metadata");
    expect(v).toHaveAttribute("poster", PROPS.poster);
    expect(v).toHaveAttribute("aria-hidden", "true");
    expect(v).toHaveAttribute("tabindex", "-1");
    expect(v).toHaveAttribute("data-hero-clip");
    // React writes `muted` as a property; the effect mirrors it to the attribute via defaultMuted.
    expect(v.muted).toBe(true);
    expect(v).toHaveAttribute("muted");
    expect(v).not.toHaveAttribute("loop");
    expect(v.loop).toBe(false);
    expect(v).not.toHaveAttribute("controls");

    const sources = [...v.querySelectorAll("source")].map((s) => [s.getAttribute("src"), s.getAttribute("type")]);
    expect(sources).toEqual([
      [PROPS.webm, "video/webm"],
      [PROPS.mp4, "video/mp4"],
    ]);
    expect(play).toHaveBeenCalledTimes(1);
  });

  it("default mode: a later re-render neither remounts nor replays (never re-decide, §5.3.4)", async () => {
    mockSignals({});
    const { container, rerender } = render(<HeroClip {...PROPS} />);
    await waitFor(() => expect(video(container)).not.toBeNull());
    const first = video(container);
    // Flip the signals after the decision — HeroClip must not read them again.
    mockSignals({ reducedMotion: true });
    rerender(<HeroClip {...PROPS} />);
    expect(video(container)).toBe(first);
    expect(play).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["prefers-reduced-motion: reduce", { reducedMotion: true }],
    ["coarse pointer / touch", { coarse: true }],
    ["Save-Data", { saveData: true }],
  ] satisfies [string, Signals][])("%s: never mounts a <video>, never calls play()", async (_label, signals) => {
    mockSignals(signals);
    const { container } = render(<HeroClip {...PROPS} />);
    // Let the mount effect settle; the poster-only branch renders nothing at all.
    await waitFor(() => expect(play).not.toHaveBeenCalled());
    await new Promise((r) => setTimeout(r, 20));
    expect(video(container)).toBeNull();
    expect(container.innerHTML).toBe("");
    expect(play).not.toHaveBeenCalled();
  });

  it("play() rejected (autoplay policy) → the video unmounts and the poster shows (error state)", async () => {
    mockSignals({});
    play.mockImplementation(() => Promise.reject(new Error("NotAllowedError")));
    const { container } = render(<HeroClip {...PROPS} />);
    await waitFor(() => expect(play).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(video(container)).toBeNull());
    expect(container.innerHTML).toBe("");
  });

  it("an `error` event on the video → unmounts (decode / network failure → poster)", async () => {
    mockSignals({});
    const { container } = render(<HeroClip {...PROPS} />);
    await waitFor(() => expect(video(container)).not.toBeNull());
    video(container)!.dispatchEvent(new Event("error"));
    await waitFor(() => expect(video(container)).toBeNull());
  });

  it("source contains none of the restart primitives (TC-141 step 6 grep, outside the lint comment)", () => {
    const src = readFileSync(join(process.cwd(), "components/hero/HeroClip.tsx"), "utf8")
      // Drop block comments so the lint-contract comment's own mentions do not count.
      .replace(/\/\*[\s\S]*?\*\//g, "");
    expect(src).not.toMatch(/\.currentTime\s*=/);
    expect(src).not.toMatch(/\.load\(/);
    expect(src).not.toMatch(/\bloop\b/);
    expect(src).not.toMatch(/visibilitychange/);
    expect(src).not.toMatch(/addEventListener\(\s*["']change["']/);
    expect(src).not.toMatch(/onEnded/);
  });
});

/**
 * TKT-93 — the clip's registration on the banner (decision EXE-15; `components/hero/registration.ts`).
 * The prototype measured the 1280×684 clip on the 3168×1344 outpaint at scale 1.912, x 362, y 6; the
 * percentages `Hero` writes as `--clip-*` must be exactly those numbers (the e2e registration guard
 * in eval-019.spec.ts measures the rendered boxes against the same module).
 */
describe("hero clip registration (TKT-93 · EXE-15)", () => {
  it("is derived from the measured placement, not typed in", () => {
    expect(BANNER_SIZE).toEqual({ width: 3168, height: 1344 });
    expect(CLIP_SIZE).toEqual({ width: 1280, height: 684 });
    expect(CLIP_PLACEMENT).toEqual({ scale: 1.912, x: 362, y: 6 });
    expect(CLIP_REGISTRATION.left).toBeCloseTo(11.4268, 3);
    expect(CLIP_REGISTRATION.top).toBeCloseTo(0.4464, 3);
    expect(CLIP_REGISTRATION.width).toBeCloseTo(77.2525, 3);
    expect(CLIP_REGISTRATION.height).toBeCloseTo(97.3071, 3);
    // The scaled clip stays inside the banner.
    expect(CLIP_REGISTRATION.left + CLIP_REGISTRATION.width).toBeLessThanOrEqual(100);
    expect(CLIP_REGISTRATION.top + CLIP_REGISTRATION.height).toBeLessThanOrEqual(100);
  });

  it("clipSlotStyle() emits the four --clip-* variables at four decimals", () => {
    expect(clipSlotStyle()).toEqual({
      "--clip-left": "11.4268%",
      "--clip-top": "0.4464%",
      "--clip-width": "77.2525%",
      "--clip-height": "97.3071%",
    });
  });
});
