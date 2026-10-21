"use client";

import { useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from "react";
import Image from "next/image";
import { AlertTriangle, Play } from "lucide-react";
import { ProductLogo } from "./ProductLogo";
import type { ProductLogo as ProductLogoFiles } from "@/lib/portfolio";
import { useVideoAnalytics } from "@/lib/analytics/use-video-analytics";
import {
  embedOrigin,
  embedUrl,
  playerHandshake,
  providerLabel,
  readPlayerMessage,
  readySignal,
  watchUrl,
  type VideoMedia,
} from "@/lib/video-providers";

export type PlayerState = "poster" | "loading" | "ready" | "error";

/** Overall budget for the player to come up after the press (stop rule for the handshake loop). */
export const READY_TIMEOUT_MS = 15_000;
/** After the iframe's own `load` event, a real player answers within ~1 s; an error page never does. */
export const LOAD_GRACE_MS = 6_000;
const HANDSHAKE_INTERVAL_MS = 500;

export interface ProductMediaPlayerProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  media: VideoMedia;
  /** Shown under the play button (and behind the fallback) when `media.poster` is absent — the product cover. */
  fallbackPoster?: ReactNode;
  /** Test/QA hook — the production default is `READY_TIMEOUT_MS`. */
  readyTimeoutMs?: number;
  /** TASK-194: which product / mode this player belongs to. Absent (the QA boards) → no analytics. */
  analytics?: { projectId: string; videoType: "pitch" | "demo" } | undefined;
  /** TASK-210: the viewer just pressed "Watch demo / pitch" — that press is the play gesture, so the player starts on mount. Never set by a selection. */
  autoStart?: boolean | undefined;
  /** TASK-253: the auto-start came from SELECTING the product — on a touch device (`pointer: coarse`) it starts muted, since mobile browsers block sound-on autoplay. */
  autoMute?: boolean | undefined;
  /** TASK-304: the origami paper skin (desktop stage). Adds the title panel, the folded play triangle and a YouTube link in the poster state. */
  paper?: { name: string; logo?: ProductLogoFiles | undefined } | undefined;
}

/**
 * The one reusable product player (TASK-122, video-embed spec §2–§5, §10–§12, §15–§17). Provider
 * specifics (hosts, URL params, id checks, player messages) all live in `lib/video-providers.ts`.
 *
 *   poster  → the custom poster (or `fallbackPoster`) + one Play button. No iframe exists yet (§11).
 *   loading → the Play press mounts ONE privacy-enhanced iframe. `autoplay=1` is set only because the
 *             iframe is created by a viewer's action: the press, or (TASK-253) choosing the product / pressing
 *             "Watch …" (`autoStart`); nothing ever plays on page load or a deep link (§5). Focus moves into the player.
 *   ready   → the player answered the handshake. Its native UI (incl. fullscreen and YouTube's own
 *             end screen) is never covered or altered (§4, §7, §8).
 *   error   → the player reported an error, the CSP blocked it, or it never came up in time: the
 *             iframe is removed, the poster returns with "Video unavailable here." and a secondary
 *             "Watch on YouTube ↗" link (§16, §17).
 *
 * The host keys this component by product + mode, so a switch unmounts it — stopping playback — and
 * the next one starts at its poster, from the beginning (§5, §13). One instance → at most one iframe.
 */
export function ProductMediaPlayer({ media, fallbackPoster, readyTimeoutMs = READY_TIMEOUT_MS, analytics, autoStart = false, autoMute = false, paper, ...rest }: ProductMediaPlayerProps) {
  const [state, setState] = useState<PlayerState>("poster");
  const [src, setSrc] = useState<string | null>(null);
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const [loaded, setLoaded] = useState(false);
  const label = providerLabel(media.provider);
  // TASK-194: reports "started" only once the player says it is playing, never on the Play press.
  useVideoAnalytics(frameRef, Boolean(analytics) && (state === "loading" || state === "ready"), {
    projectId: analytics?.projectId ?? "",
    videoType: analytics?.videoType ?? "pitch",
    provider: media.provider,
    origin: embedOrigin(media.provider),
  });

  // While loading: listen for the player's answer and for a CSP block; give up after the budget.
  useEffect(() => {
    if (state !== "loading") return;
    const origin = embedOrigin(media.provider);
    const fail = (reason: string) => {
      // Never silent (A12): the fallback is visible, and the reason is logged for whoever debugs it.
      console.warn("[product-media-player]", `${media.provider}:${media.videoId}`, reason);
      setState("error");
    };
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== origin || event.source !== frameRef.current?.contentWindow) return;
      const signal = readPlayerMessage(media.provider, event.data);
      if (signal === "ready") setState("ready");
      else if (signal === "error") fail("player reported an error");
    };
    const onViolation = (event: SecurityPolicyViolationEvent) => {
      if (event.blockedURI.startsWith(origin)) fail(`blocked by CSP (${event.violatedDirective})`);
    };
    window.addEventListener("message", onMessage);
    document.addEventListener("securitypolicyviolation", onViolation);
    const timeout = window.setTimeout(() => fail(`no response within ${readyTimeoutMs} ms`), readyTimeoutMs);
    return () => {
      window.removeEventListener("message", onMessage);
      document.removeEventListener("securitypolicyviolation", onViolation);
      window.clearTimeout(timeout);
    };
  }, [state, media.provider, media.videoId, readyTimeoutMs]);

  // After the iframe's `load`: ping the handshake until the player answers (or the grace runs out).
  useEffect(() => {
    if (state !== "loading" || !loaded) return;
    const origin = embedOrigin(media.provider);
    const handshake = playerHandshake(media.provider);
    const ping = () => {
      if (handshake) frameRef.current?.contentWindow?.postMessage(handshake, origin);
    };
    ping();
    const interval = window.setInterval(ping, HANDSHAKE_INTERVAL_MS);
    const grace = window.setTimeout(() => {
      console.warn("[product-media-player]", `${media.provider}:${media.videoId}`, `loaded but silent for ${LOAD_GRACE_MS} ms`);
      setState("error");
    }, LOAD_GRACE_MS);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(grace);
    };
  }, [state, loaded, media.provider, media.videoId]);

  // Keyboard/screen-reader users land in the player they just asked for — except when it started because they
  // chose a product (TASK-253): focus stays on the carousel so the arrow keys keep stepping through the products.
  // Stage 9 CR-015: focus moves once the player has answered — while it loads, the poster covers the iframe.
  useEffect(() => {
    if (state === "ready" && !(autoStart && autoMute)) frameRef.current?.focus();
  }, [state, autoStart, autoMute]);

  const play = (auto = false) => {
    const mute = auto && autoMute && window.matchMedia("(pointer: coarse)").matches;
    setSrc(embedUrl(media, { autoplay: true, origin: window.location.origin, mute }));
    setLoaded(false);
    setState("loading");
  };

  // TASK-210: "Watch demo" on a phone = a press asking to play (the stage was just remounted for it).
  const startedRef = useRef(false);
  useEffect(() => {
    if (!autoStart || startedRef.current) return;
    startedRef.current = true;
    play(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `play` only reads `media` + the origin, fixed for this mounted player
  }, [autoStart]);

  const showFrame = (state === "loading" || state === "ready") && src;
  // one poster node for the poster state and the loading state (CR-017)
  const poster = media.poster ? <Image src={media.poster} alt="" fill sizes="(min-width: 1024px) 60vw, 100vw" className="pf-stage-poster" /> : fallbackPoster;

  return (
    <div {...rest} {...(paper ? { "data-paper-player": "" } : {})} data-no-trail="" data-player-state={state} data-provider={media.provider}>
      {showFrame ? (
        <iframe
          ref={frameRef}
          className="pf-player"
          src={src}
          title={media.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          loading="lazy"
          // YouTube refuses to play embeds that send no referrer (player error 153).
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => (readySignal(media.provider) === "load" ? setState("ready") : setLoaded(true))}
        />
      ) : null}
      {/* Stage 8 DES-016 (TASK-313): the poster stays over the iframe until the player answers, so a pick never flashes a blank frame */}
      {/* Stage 8 DES-016 (TASK-313) / Stage 9 CR-011: while the player loads, the poster stays — as a direct child, so every
          skin's own sizing rules still apply (a wrapper left the case-study covers at their intrinsic width) — over the
          iframe, with a polite status for assistive tech */}
      {showFrame && state === "loading" ? (
        <>
          {poster}
          <span className="sr-only" role="status" data-loading-status="">
            Loading video…
          </span>
        </>
      ) : null}
      {showFrame ? null : (
        <>
          {poster}
          {state === "poster" ? (
            <>
              {paper ? (
                <>
                  <span className="pp-title">
                    {paper.logo ? <ProductLogo name={paper.name} logo={paper.logo} /> : null}
                    <span className="pp-title-text">{media.title}</span>
                  </span>
                  <a href={watchUrl(media)} target="_blank" rel="noopener noreferrer" className="pp-watch focus-ring">
                    Watch on {label} <span aria-hidden="true">↗</span>
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </>
              ) : null}
              <button type="button" className="pf-play focus-ring" onClick={() => play()} aria-label={`Play ${media.title}`}>
                {paper ? <OrigamiPlay /> : <Play aria-hidden="true" focusable="false" strokeWidth={1.75} />}
              </button>
            </>
          ) : (
            <p className="pf-stage-error" role="alert">
              <AlertTriangle aria-hidden="true" focusable="false" strokeWidth={1.75} />
              Video unavailable here.{" "}
              <a href={watchUrl(media)} target="_blank" rel="noopener noreferrer" className="focus-ring" data-inline-link="">
                Watch on {label} <span aria-hidden="true">↗</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </p>
          )}
        </>
      )}
    </div>
  );
}

/** TASK-304: the folded-paper play triangle — four facets (burnt-red shadow fold, terracotta face, warm-orange lit tip, deep underside). */
function OrigamiPlay() {
  return (
    <svg className="pp-origami" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <polygon className="pp-f-under" points="28,90 92,50 60,52" />
      <polygon className="pp-f-face" points="28,10 92,50 60,52" />
      <polygon className="pp-f-lit" points="62,31 92,50 60,52" />
      <polygon className="pp-f-shade" points="28,10 28,90 60,52" />
    </svg>
  );
}
