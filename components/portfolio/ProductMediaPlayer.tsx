"use client";

import { useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from "react";
import Image from "next/image";
import { AlertTriangle, Play } from "lucide-react";
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
}

/**
 * The one reusable product player (TASK-122, video-embed spec §2–§5, §10–§12, §15–§17). Provider
 * specifics (hosts, URL params, id checks, player messages) all live in `lib/video-providers.ts`.
 *
 *   poster  → the custom poster (or `fallbackPoster`) + one Play button. No iframe exists yet (§11).
 *   loading → the Play press mounts ONE privacy-enhanced iframe. `autoplay=1` is set only because the
 *             iframe is created by that press (the viewer asked to play); nothing ever plays on
 *             product selection or page load (§5). Focus moves into the player.
 *   ready   → the player answered the handshake. Its native UI (incl. fullscreen and YouTube's own
 *             end screen) is never covered or altered (§4, §7, §8).
 *   error   → the player reported an error, the CSP blocked it, or it never came up in time: the
 *             iframe is removed, the poster returns with "Video unavailable here." and a secondary
 *             "Watch on YouTube ↗" link (§16, §17).
 *
 * The host keys this component by product + mode, so a switch unmounts it — stopping playback — and
 * the next one starts at its poster, from the beginning (§5, §13). One instance → at most one iframe.
 */
export function ProductMediaPlayer({ media, fallbackPoster, readyTimeoutMs = READY_TIMEOUT_MS, ...rest }: ProductMediaPlayerProps) {
  const [state, setState] = useState<PlayerState>("poster");
  const [src, setSrc] = useState<string | null>(null);
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const [loaded, setLoaded] = useState(false);
  const label = providerLabel(media.provider);

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

  // Keyboard/screen-reader users land in the player they just asked for.
  useEffect(() => {
    if (state === "loading") frameRef.current?.focus();
  }, [state]);

  const play = () => {
    setSrc(embedUrl(media, { autoplay: true, origin: window.location.origin }));
    setLoaded(false);
    setState("loading");
  };

  const showFrame = (state === "loading" || state === "ready") && src;

  return (
    <div {...rest} data-player-state={state} data-provider={media.provider}>
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
      ) : (
        <>
          {media.poster ? (
            <Image src={media.poster} alt="" fill sizes="(min-width: 1024px) 60vw, 100vw" className="pf-stage-poster" />
          ) : (
            fallbackPoster
          )}
          {state === "poster" ? (
            <button type="button" className="pf-play focus-ring" onClick={play} aria-label={`Play ${media.title}`}>
              <Play aria-hidden="true" focusable="false" strokeWidth={1.75} />
            </button>
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
