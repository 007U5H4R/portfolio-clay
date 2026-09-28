"use client";

import { useEffect, useRef } from "react";
import type { VideoSource } from "@/data/schema";

export interface ProductVideoProps {
  source: VideoSource;
  /** Accessible title, e.g. "TeachSpark — pitch video". */
  title: string;
  /** A local file failed to load or decode (spec §49). Embeds cannot report this cross-origin. */
  onError: () => void;
}

/**
 * The one product player (TASK-116, spec §10, §23). Mounted only after the viewer presses play, and
 * only for the active product + mode: the stage keys it by `<product>:<mode>`, so switching product
 * or Pitch ↔ Demo unmounts it, which stops playback and resets the next one to its start. Loaded with
 * `next/dynamic` from `MainMediaStage`, so no player code ships until someone presses play.
 *
 *   file    → native `<video controls playsInline preload="metadata">`, played on mount (the press was
 *             the user's intent). Not muted: a pitch has a voice-over, and nothing plays before a press.
 *   youtube → the privacy-enhanced `youtube-nocookie.com` embed; vimeo → `player.vimeo.com`. Both get
 *             `autoplay=1` because the iframe itself is the result of the press (CSP `frame-src` allows
 *             exactly these two hosts, next.config.ts).
 */
export function ProductVideo({ source, title, onError }: ProductVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (source.kind !== "file") return;
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    const playing = video.play() as Promise<void> | undefined;
    playing?.catch((err: unknown) => {
      // A browser-policy rejection (not a load failure — onError covers those). Never silent (A12);
      // the native controls stay available for a second press.
      console.warn("[portfolio-video]", err);
    });
  }, [source]);

  if (source.kind === "file") {
    return (
      <video
        ref={videoRef}
        className="pf-player"
        src={source.src}
        poster={source.poster}
        preload="metadata"
        playsInline
        controls
        aria-label={title}
        onError={() => {
          console.warn("[portfolio-video]", videoRef.current?.error ?? new Error(`failed to load ${source.src}`));
          onError();
        }}
      />
    );
  }

  const src =
    source.kind === "youtube"
      ? `https://www.youtube-nocookie.com/embed/${source.id}?autoplay=1&rel=0&modestbranding=1`
      : `https://player.vimeo.com/video/${source.id}?autoplay=1&dnt=1`;
  return (
    <iframe
      className="pf-player"
      src={src}
      title={title}
      allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
    />
  );
}
