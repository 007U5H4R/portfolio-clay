"use client";

/*
 * TSK-37 · file-scoped lint contract (Design.md §5.3.4, decision TP13, TC-141 step 6): this component
 * never touches the media element after mounting it — no `currentTime` writes, no `load()`, no
 * `loop`, no `visibilitychange`, no media-query `change` listeners. An inline configuration comment
 * (not an `eslint.config.mjs` block — the repo's config-protection hook keeps that file frozen) so
 * `pnpm lint` fails on any of them; `tests/unit/hero-clip.test.tsx` greps the source for the same list
 * from outside the file.
 */
/* eslint no-restricted-syntax: ["error",
  { "selector": "AssignmentExpression > MemberExpression.left[property.name='currentTime']", "message": "HeroClip never sets currentTime — the clip plays once and holds (TP13)." },
  { "selector": "CallExpression > MemberExpression.callee[property.name='load']", "message": "HeroClip never calls load() — a reload would restart the clip (TP13)." },
  { "selector": "JSXAttribute[name.name='loop']", "message": "The hero clip never loops (S14 / Design.md §5.2)." },
  { "selector": "Literal[value='visibilitychange']", "message": "HeroClip ignores visibilitychange — never re-decide or restart (Design.md §5.3.4)." },
  { "selector": "CallExpression[callee.property.name='addEventListener'] > Literal[value='change']", "message": "HeroClip reads media queries once — no change listeners (Design.md §5.3.4)." }
] */

import { useEffect, useRef, useState } from "react";

export type HeroClipProps = {
  /** The poster file — the same URL the static `<img>` renders (Design.md §5.2). */
  poster: string;
  /** Clip renditions, in `<source>` order: webm first, mp4 second. */
  webm: string;
  mp4: string;
};

/** `idle` = server + first client render (renders nothing); decided once after hydration (TP13). */
type Mode = "idle" | "video" | "poster";

type NavigatorWithConnection = Navigator & { connection?: { saveData?: boolean } };

/**
 * The one-shot hero clip (Design.md §5.3; decisions D10 / TP13). Renders `null` on the server and on
 * the first client render, so the SSR HTML never carries a `<video>`. One effect reads the three
 * poster-only signals **once** — `prefers-reduced-motion`, `(hover: none), (pointer: coarse)`,
 * `navigator.connection.saveData` — and settles on `"poster"` (render nothing; the static `<img>`
 * stays) or `"video"` (mount the clip over the poster). A rejected `play()` (autoplay policy) or an
 * `error` event unmounts the video again — the "error" screen state is the poster.
 *
 * Never re-decides (§5.3.4): no media-query listeners, no `visibilitychange`, no `load()`, no
 * `currentTime` writes, no `loop`, no `onEnded` — `ended` leaves the element paused on its last frame,
 * which is the held frame. The ESLint `no-restricted-syntax` block scoped to this file and TC-141
 * step 6 enforce that list.
 */
export function HeroClip({ poster, webm, mp4 }: HeroClipProps) {
  const [mode, setMode] = useState<Mode>("idle");
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const posterOnly =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(hover: none), (pointer: coarse)").matches ||
      (navigator as NavigatorWithConnection).connection?.saveData === true;
    // The one deliberate mount-time setState: the server cannot know the mode (TP1 static routes),
    // the first client render must match the SSR HTML (no <video>), and a subscription
    // (useSyncExternalStore / media-query listeners) is what TP13 rejected — a later signal change
    // must never re-decide. One extra render on mount, once, is the accepted cost.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMode(posterOnly ? "poster" : "video");
  }, []);

  useEffect(() => {
    if (mode !== "video") return;
    const video = ref.current;
    if (!video) return;
    // React sets `muted` as a DOM *property* on client renders, not as the content attribute;
    // `defaultMuted` reflects the `muted` attribute, so the mounted element carries the attribute
    // the autoplay contract names (TC-140 step 1) as well as the muted state autoplay policy needs.
    video.defaultMuted = true;
    video.muted = true;
    const playing = video.play();
    if (playing && typeof playing.catch === "function") {
      playing.catch(() => setMode("poster"));
    }
  }, [mode]);

  if (mode !== "video") return null;

  return (
    <video
      ref={ref}
      className="hero-clip"
      autoPlay
      muted
      playsInline
      preload="metadata"
      poster={poster}
      aria-hidden="true"
      tabIndex={-1}
      data-hero-clip=""
      onError={() => setMode("poster")}
    >
      <source src={webm} type="video/webm" />
      <source src={mp4} type="video/mp4" />
    </video>
  );
}
