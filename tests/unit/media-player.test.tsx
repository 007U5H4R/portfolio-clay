import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { LOAD_GRACE_MS, ProductMediaPlayer, READY_TIMEOUT_MS } from "@/components/portfolio/ProductMediaPlayer";
import type { VideoMedia } from "@/lib/video-providers";

/**
 * TASK-122 — ProductMediaPlayer (video-embed spec §5, §10–§12, §15–§17). jsdom never loads the
 * embed; the player's answers are simulated as `message` events from the iframe's own window.
 */
const PITCH: VideoMedia = { provider: "youtube", videoId: "abcdefghijk", title: "TeachSpark pitch video" };
const YT_ORIGIN = "https://www.youtube-nocookie.com";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const frames = () => document.querySelectorAll("iframe");
const host = () => document.querySelector("[data-player-state]")!;

function pressPlay(title = PITCH.title) {
  fireEvent.click(screen.getByRole("button", { name: `Play ${title}` }));
  return document.querySelector("iframe")!;
}

function fromPlayer(frame: HTMLIFrameElement, data: unknown, origin = YT_ORIGIN) {
  act(() => {
    window.dispatchEvent(new MessageEvent("message", { data: JSON.stringify(data), origin, source: frame.contentWindow }));
  });
}

describe("ProductMediaPlayer", () => {
  it("poster state: the fallback poster + one labelled Play button, and NO iframe (§10, §11, §15)", () => {
    render(<ProductMediaPlayer media={PITCH} fallbackPoster={<div data-testid="cover" />} />);
    expect(screen.getByTestId("cover")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Play TeachSpark pitch video" })).toBeInTheDocument();
    expect(frames()).toHaveLength(0);
    expect(host()).toHaveAttribute("data-player-state", "poster");
  });

  it("Play mounts exactly one privacy-enhanced iframe with a descriptive title, focused (§1, §11, §15)", () => {
    render(<ProductMediaPlayer media={PITCH} />);
    const frame = pressPlay();
    expect(frames()).toHaveLength(1);
    const src = new URL(frame.src);
    expect(src.origin).toBe(YT_ORIGIN);
    expect(src.pathname).toBe("/embed/abcdefghijk");
    expect(src.searchParams.get("rel")).toBe("0");
    expect(src.searchParams.get("playsinline")).toBe("1");
    expect(src.searchParams.get("autoplay")).toBe("1"); // created by the press — never on selection
    expect(frame).toHaveAttribute("title", "TeachSpark pitch video");
    expect(frame).toHaveAttribute("allowfullscreen");
    expect(frame).toHaveAttribute("loading", "lazy");
    expect(frame).toHaveAttribute("referrerpolicy", "strict-origin-when-cross-origin");
    expect(frame.getAttribute("allow")).toContain("autoplay");
    expect(document.activeElement).toBe(frame);
    expect(screen.queryByRole("button", { name: /^Play / })).toBeNull();
    expect(host()).toHaveAttribute("data-player-state", "loading");
  });

  it("the player's ready message → ready; messages from other origins/windows are ignored", () => {
    render(<ProductMediaPlayer media={PITCH} />);
    const frame = pressPlay();
    fromPlayer(frame, { event: "onReady" }, "https://evil.test");
    act(() => {
      window.dispatchEvent(new MessageEvent("message", { data: JSON.stringify({ event: "onReady" }), origin: YT_ORIGIN, source: window }));
    });
    expect(host()).toHaveAttribute("data-player-state", "loading");
    fromPlayer(frame, { event: "initialDelivery", info: {} });
    expect(host()).toHaveAttribute("data-player-state", "ready");
    expect(frames()).toHaveLength(1);
  });

  it("the load handshake posts 'listening' to the embed origin only", () => {
    render(<ProductMediaPlayer media={PITCH} />);
    const frame = pressPlay();
    const post = vi.spyOn(frame.contentWindow!, "postMessage").mockImplementation(() => {});
    fireEvent.load(frame);
    expect(post).toHaveBeenCalledWith(JSON.stringify({ event: "listening", id: 1, channel: "widget" }), YT_ORIGIN);
  });

  it("a player error (e.g. embedding disabled) → poster back, 'Video unavailable here.' + Watch on YouTube (§17)", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<ProductMediaPlayer media={PITCH} fallbackPoster={<div data-testid="cover" />} />);
    const frame = pressPlay();
    fromPlayer(frame, { event: "onError", info: 150 });
    expect(frames()).toHaveLength(0);
    expect(screen.getByTestId("cover")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Video unavailable here.");
    const link = screen.getByRole("link", { name: /^Watch on YouTube/ });
    expect(link).toHaveAttribute("href", "https://www.youtube.com/watch?v=abcdefghijk");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(host()).toHaveAttribute("data-player-state", "error");
    expect(console.warn).toHaveBeenCalled(); // never silent
  });

  it("no answer within the budget → the fallback (a blocked embed never leaves a black box)", () => {
    vi.useFakeTimers();
    vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<ProductMediaPlayer media={PITCH} />);
    pressPlay();
    act(() => vi.advanceTimersByTime(READY_TIMEOUT_MS - 1));
    expect(host()).toHaveAttribute("data-player-state", "loading");
    act(() => vi.advanceTimersByTime(1));
    expect(host()).toHaveAttribute("data-player-state", "error");
    expect(frames()).toHaveLength(0);
  });

  it("loaded but silent (an error page) → the fallback after the grace period", () => {
    vi.useFakeTimers();
    vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<ProductMediaPlayer media={PITCH} />);
    const frame = pressPlay();
    fireEvent.load(frame);
    act(() => vi.advanceTimersByTime(LOAD_GRACE_MS));
    expect(host()).toHaveAttribute("data-player-state", "error");
  });

  it("a CSP block of the embed origin → the fallback at once", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<ProductMediaPlayer media={PITCH} />);
    pressPlay();
    act(() => {
      const event = new Event("securitypolicyviolation") as Event & { blockedURI: string; violatedDirective: string };
      Object.assign(event, { blockedURI: `${YT_ORIGIN}/embed/abcdefghijk`, violatedDirective: "frame-src" });
      document.dispatchEvent(event);
    });
    expect(host()).toHaveAttribute("data-player-state", "error");
  });

  it("a new key (product or Pitch ↔ Demo change) unmounts the iframe and resets to the poster (§5, §13)", () => {
    const DEMO: VideoMedia = { ...PITCH, videoId: "zyxwvutsrqp", title: "TeachSpark product demonstration" };
    const { rerender } = render(<ProductMediaPlayer key="ts:pitch" media={PITCH} />);
    pressPlay();
    expect(frames()).toHaveLength(1);
    rerender(<ProductMediaPlayer key="ts:demo" media={DEMO} />);
    expect(frames()).toHaveLength(0);
    expect(screen.getByRole("button", { name: "Play TeachSpark product demonstration" })).toBeInTheDocument();
  });

  it("Vimeo: player.vimeo.com, ready on load, 'Watch on Vimeo' fallback", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const VM: VideoMedia = { provider: "vimeo", videoId: "123456789", title: "RailCite product demonstration" };
    render(<ProductMediaPlayer media={VM} />);
    const frame = pressPlay(VM.title);
    expect(new URL(frame.src).origin).toBe("https://player.vimeo.com");
    fireEvent.load(frame);
    expect(host()).toHaveAttribute("data-player-state", "ready");
  });

  it("a custom poster renders instead of the fallback (§10)", () => {
    render(<ProductMediaPlayer media={{ ...PITCH, poster: "/media/posters/teachspark.webp" }} fallbackPoster={<div data-testid="cover" />} />);
    expect(screen.queryByTestId("cover")).toBeNull();
    expect(document.querySelector("img")?.getAttribute("src")).toContain("teachspark.webp");
  });
});
