/**
 * Video providers (TASK-122, Tushar's video-embed spec 2026-09-28 §1–§4, §7, §16, §19) — the ONLY
 * module that knows a provider's embed host, URL format, id shape or player messages. The player
 * (`ProductMediaPlayer`), the data schema and the CSP (`lib/csp.ts`) all read from here, so moving a
 * product from YouTube to Vimeo is a data change (`provider` + `videoId`), never a UI rewrite.
 *
 * Deliberately dependency-free (no zod, no React, no path aliases): `next.config.ts` imports it via
 * `lib/csp.ts` at config time, and the client player imports it too.
 */

export const VIDEO_PROVIDERS = ["youtube", "vimeo"] as const;
export type VideoProvider = (typeof VIDEO_PROVIDERS)[number];

/** One embeddable video (spec §3). `title` is the player's accessible name, e.g. "TeachSpark pitch video". */
export interface VideoMedia {
  provider: VideoProvider;
  videoId: string;
  title: string;
  /** Custom portfolio poster (spec §10). Absent → the caller's own poster (the product cover). */
  poster?: string | undefined;
}

interface ProviderDef {
  label: string;
  /** The one origin the embed is served from — also the CSP `frame-src` source for this provider. */
  embedOrigin: string;
  idPattern: RegExp;
  embedUrl: (id: string, autoplay: boolean, origin: string | undefined) => string;
  watchUrl: (id: string) => string;
}

const PROVIDERS: Record<VideoProvider, ProviderDef> = {
  youtube: {
    label: "YouTube",
    // Privacy-enhanced host only (spec §1) — never the cookie-setting www.youtube.com embed (tests/unit/csp.test.ts).
    embedOrigin: "https://www.youtube-nocookie.com",
    idPattern: /^[A-Za-z0-9_-]{11}$/,
    embedUrl: (id, autoplay, origin) => {
      // rel=0 only LIMITS related videos to the same channel; it does not remove the end screen (§4, §7).
      // enablejsapi + origin are YouTube's documented postMessage handshake — used only to learn that
      // the player came up (or reported an error) so a blocked embed can fall back (§17). No SDK.
      const params = new URLSearchParams({ rel: "0", playsinline: "1" });
      if (autoplay) params.set("autoplay", "1");
      if (origin) {
        params.set("enablejsapi", "1");
        params.set("origin", origin);
      }
      return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
    },
    watchUrl: (id) => `https://www.youtube.com/watch?v=${id}`,
  },
  vimeo: {
    label: "Vimeo",
    embedOrigin: "https://player.vimeo.com",
    idPattern: /^\d{6,12}$/,
    embedUrl: (id, autoplay) => {
      // dnt=1: no tracking cookies. title/byline/portrait=0: no Vimeo chrome over the poster frame.
      // The clean END screen ("Empty") is a per-video / per-account Vimeo embed setting, not a URL
      // parameter — set it in Vimeo when a product moves there (§7).
      const params = new URLSearchParams({ dnt: "1", playsinline: "1", title: "0", byline: "0", portrait: "0" });
      if (autoplay) params.set("autoplay", "1");
      return `https://player.vimeo.com/video/${id}?${params.toString()}`;
    },
    watchUrl: (id) => `https://vimeo.com/${id}`,
  },
};

export function isVideoProvider(value: unknown): value is VideoProvider {
  return typeof value === "string" && (VIDEO_PROVIDERS as readonly string[]).includes(value);
}

export function isValidVideoId(provider: VideoProvider, videoId: string): boolean {
  return PROVIDERS[provider].idPattern.test(videoId);
}

export function providerLabel(provider: VideoProvider): string {
  return PROVIDERS[provider].label;
}

export function embedOrigin(provider: VideoProvider): string {
  return PROVIDERS[provider].embedOrigin;
}

export interface EmbedOptions {
  /** Only ever true when the iframe is mounted BY the viewer's own Play press (spec §5, §11). */
  autoplay?: boolean;
  /** The page origin — enables the ready/error handshake (YouTube). Omit for a bare embed URL. */
  origin?: string;
}

/** The iframe `src` for a media item. Throws on an invalid id — an id is never interpolated unchecked. */
export function embedUrl(media: Pick<VideoMedia, "provider" | "videoId">, opts: EmbedOptions = {}): string {
  const def = PROVIDERS[media.provider];
  if (!def.idPattern.test(media.videoId)) {
    throw new Error(`video-providers: invalid ${def.label} id "${media.videoId}"`);
  }
  return def.embedUrl(media.videoId, opts.autoplay ?? false, opts.origin);
}

/** The secondary "Watch on YouTube ↗" link, shown only when the embed cannot load (spec §16–§17). */
export function watchUrl(media: Pick<VideoMedia, "provider" | "videoId">): string {
  const def = PROVIDERS[media.provider];
  if (!def.idPattern.test(media.videoId)) {
    throw new Error(`video-providers: invalid ${def.label} id "${media.videoId}"`);
  }
  return def.watchUrl(media.videoId);
}

/** The CSP `frame-src` sources for the providers in use (deduplicated, stable order). */
export function frameSources(providers: Iterable<VideoProvider>): string[] {
  const used = new Set(providers);
  return VIDEO_PROVIDERS.filter((p) => used.has(p)).map((p) => PROVIDERS[p].embedOrigin);
}

/**
 * How the player tells us it came up. YouTube: the parent posts `listening` (YouTube's documented
 * iframe-API handshake — no SDK) until the player answers with `initialDelivery`/`onReady`, or
 * `onError` (e.g. 101/150: the owner disabled embedding). Vimeo: its player-API messages are not
 * exercised here (no product uses Vimeo), so the iframe `load` event counts as ready; a CSP block is
 * still caught by the `securitypolicyviolation` listener.
 */
export function readySignal(provider: VideoProvider): "message" | "load" {
  return provider === "youtube" ? "message" : "load";
}

/** The handshake the parent posts to a `message`-signalling player (see `readySignal`). */
export function playerHandshake(provider: VideoProvider): string | null {
  return provider === "youtube" ? JSON.stringify({ event: "listening", id: 1, channel: "widget" }) : null;
}

export type PlayerSignal = "ready" | "error";

/**
 * Reads one `message` event payload from a YouTube player: `ready`, `error`, or null for anything
 * else. The caller must already have checked `event.origin` and `event.source`.
 */
export function readPlayerMessage(provider: VideoProvider, data: unknown): PlayerSignal | null {
  if (provider !== "youtube") return null;
  let msg: unknown = data;
  if (typeof data === "string") {
    try {
      msg = JSON.parse(data);
    } catch {
      return null;
    }
  }
  if (!msg || typeof msg !== "object") return null;
  const event = (msg as { event?: unknown }).event;
  if (event === "onReady" || event === "initialDelivery") return "ready";
  if (event === "onError") return "error";
  return null;
}
