import { describe, expect, it } from "vitest";
import {
  embedUrl,
  frameSources,
  isValidVideoId,
  playerHandshake,
  readPlayerMessage,
  readySignal,
  watchUrl,
} from "@/lib/video-providers";
import { VideoMediaEntry } from "@/data/schema";
import { resolveVideoMedia } from "@/lib/portfolio";

/**
 * TASK-122 — the provider abstraction (video-embed spec §1–§4, §7, §16, §19). Ids here are made-up
 * but well-formed; no real video is referenced.
 */
const YT = { provider: "youtube" as const, videoId: "abcdefghijk" };
const VM = { provider: "vimeo" as const, videoId: "123456789" };

describe("embedUrl", () => {
  it("YouTube uses ONLY the privacy-enhanced host with rel=0 & playsinline=1 (§1, §4)", () => {
    const url = new URL(embedUrl(YT));
    expect(url.origin).toBe("https://www.youtube-nocookie.com");
    expect(url.pathname).toBe("/embed/abcdefghijk");
    expect(url.searchParams.get("rel")).toBe("0");
    expect(url.searchParams.get("playsinline")).toBe("1");
    expect(url.searchParams.has("autoplay")).toBe(false);
    expect(url.searchParams.has("modestbranding")).toBe(false); // deprecated no-op; no UI hacks (§4)
    expect(embedUrl(YT)).not.toContain("youtube.com/embed");
  });

  it("autoplay only when asked (the Play press); origin enables the documented handshake", () => {
    const url = new URL(embedUrl(YT, { autoplay: true, origin: "https://example.test" }));
    expect(url.searchParams.get("autoplay")).toBe("1");
    expect(url.searchParams.get("enablejsapi")).toBe("1");
    expect(url.searchParams.get("origin")).toBe("https://example.test");
  });

  it("Vimeo uses player.vimeo.com with dnt=1 and no Vimeo chrome (§7)", () => {
    const url = new URL(embedUrl(VM));
    expect(url.origin).toBe("https://player.vimeo.com");
    expect(url.pathname).toBe("/video/123456789");
    expect(Object.fromEntries(url.searchParams)).toEqual({ dnt: "1", playsinline: "1", title: "0", byline: "0", portrait: "0" });
  });

  it("refuses an invalid id rather than interpolating it", () => {
    expect(() => embedUrl({ provider: "youtube", videoId: "abc\"><script>" })).toThrow(/invalid YouTube id/);
    expect(() => embedUrl({ provider: "youtube", videoId: "" })).toThrow();
    expect(() => embedUrl({ provider: "vimeo", videoId: "abc" })).toThrow(/invalid Vimeo id/);
    expect(() => watchUrl({ provider: "youtube", videoId: "../x" })).toThrow();
  });
});

describe("isValidVideoId", () => {
  it.each([
    ["youtube", "abcdefghijk", true],
    ["youtube", "A1_-b2C3d4E", true],
    ["youtube", "short", false],
    ["youtube", "abcdefghijkl", false],
    ["youtube", "abc def ghi", false],
    ["youtube", "", false],
    ["vimeo", "123456789", true],
    ["vimeo", "12345", false],
    ["vimeo", "12345abc", false],
  ] as const)("%s %j → %s", (provider, id, ok) => {
    expect(isValidVideoId(provider, id)).toBe(ok);
  });
});

describe("watchUrl (the secondary fallback link, §16–§17)", () => {
  it("points at the provider's public watch page", () => {
    expect(watchUrl(YT)).toBe("https://www.youtube.com/watch?v=abcdefghijk");
    expect(watchUrl(VM)).toBe("https://vimeo.com/123456789");
  });
});

describe("frameSources", () => {
  it("maps providers in use to their one embed origin, deduplicated, stable order", () => {
    expect(frameSources(["youtube"])).toEqual(["https://www.youtube-nocookie.com"]);
    expect(frameSources(["vimeo", "youtube", "vimeo"])).toEqual(["https://www.youtube-nocookie.com", "https://player.vimeo.com"]);
    expect(frameSources([])).toEqual([]);
  });
});

describe("player handshake + messages", () => {
  it("YouTube is message-signalled; Vimeo counts its load event", () => {
    expect(readySignal("youtube")).toBe("message");
    expect(readySignal("vimeo")).toBe("load");
    expect(JSON.parse(playerHandshake("youtube")!)).toEqual({ event: "listening", id: 1, channel: "widget" });
    expect(playerHandshake("vimeo")).toBeNull();
  });

  it("reads YouTube's ready / error messages and ignores everything else", () => {
    expect(readPlayerMessage("youtube", JSON.stringify({ event: "initialDelivery", info: {} }))).toBe("ready");
    expect(readPlayerMessage("youtube", JSON.stringify({ event: "onReady" }))).toBe("ready");
    expect(readPlayerMessage("youtube", { event: "onReady" })).toBe("ready");
    expect(readPlayerMessage("youtube", JSON.stringify({ event: "onError", info: 150 }))).toBe("error");
    expect(readPlayerMessage("youtube", JSON.stringify({ event: "infoDelivery" }))).toBeNull();
    expect(readPlayerMessage("youtube", "not json")).toBeNull();
    expect(readPlayerMessage("youtube", null)).toBeNull();
    expect(readPlayerMessage("vimeo", JSON.stringify({ event: "onReady" }))).toBeNull();
  });
});

describe("data model: VideoMediaEntry + resolveVideoMedia (§2, §3, §15)", () => {
  it("accepts a provider + valid id and rejects an id that does not fit its provider", () => {
    expect(VideoMediaEntry.safeParse({ provider: "youtube", videoId: "abcdefghijk" }).success).toBe(true);
    expect(VideoMediaEntry.safeParse({ provider: "vimeo", videoId: "123456789", title: "Vimeo demo title" }).success).toBe(true);
    expect(VideoMediaEntry.safeParse({ provider: "youtube", videoId: "123456789" }).success).toBe(false);
    expect(VideoMediaEntry.safeParse({ provider: "youtube", videoId: "" }).success).toBe(false);
    expect(VideoMediaEntry.safeParse({ provider: "dailymotion", videoId: "abcdefghijk" }).success).toBe(false);
    expect(VideoMediaEntry.safeParse({ provider: "youtube", videoId: "abcdefghijk", poster: "https://i.ytimg.com/x.jpg" }).success).toBe(false);
  });

  it("defaults the accessible title per mode and keeps an explicit one", () => {
    expect(resolveVideoMedia(YT, "TeachSpark", "pitch")).toEqual({ ...YT, title: "TeachSpark pitch video", poster: undefined });
    expect(resolveVideoMedia(YT, "TeachSpark", "demo").title).toBe("TeachSpark product demonstration");
    expect(resolveVideoMedia({ ...VM, title: "RailCite walkthrough" }, "RailCite", "demo").title).toBe("RailCite walkthrough");
  });
});
