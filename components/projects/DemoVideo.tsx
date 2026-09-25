"use client";

/**
 * DemoVideo (technical-plan.md §B M-004 TKT-18, Design.md §3 "Work page" DemoVideo, §2 error-tone
 * rule, A13 failure modes) — the reusable demo-video player consumed by `ProjectCard` grid mode,
 * `CaseStudyHeader` hero media, and `PrototypeFrame`.
 *
 * Renders exactly one of four states at any time (`data-video-state`, EVAL-014):
 *   no-video → the project has no `links.demoVideo` at all: poster fallback (or a flat placeholder
 *              tile when there is no fallback image, or it is itself `kind:'placeholder'` — never a
 *              broken `<img>`) with a "Demo coming" badge. No play control is rendered — there is
 *              nothing to play.
 *   loading  → intent has been given (see below) and the mounted `<video>` is buffering: a scrim +
 *              spinner over the poster (role="status", announced, respects reduced motion).
 *   playing  → the mounted `<video>` is actually playing: native controls, muted, playsInline.
 *   error    → the mounted `<video>` fired a network/decode error (404, throttled-to-failure, etc.):
 *              an `ink`-on-`blush` overlay (Design.md §2 "no dedicated error hue" rule) with an
 *              alert icon (colour is never the only signal) and a "View live →" link when the
 *              project has one, else a "Demo coming" fallback. Always paired with
 *              `console.warn('[video]', …)` — never a silent failure (A12).
 *
 * Between `no-video` and those three, there is an unstated fifth *phase* — `idle` — for a project
 * that HAS a video but hasn't been given "intent" yet: just the poster + a centred 56×56 play
 * button. AC2 requires no `<video>` element in the DOM at all until intent is given, so this phase
 * necessarily exists structurally even though Design.md's state list only names four. Intent is
 * given by:
 *   - a click on the play button (which also immediately calls `.play()` once the element mounts —
 *     that is the entire point of pressing play), or
 *   - on a desktop pointer (`pointer:fine`) device, the component crossing 50% into view (IO) —
 *     this only reveals the native player early so the user can press its own controls; it never
 *     autoplays.
 * `preload="none"` means neither path fetches any video bytes until the user actually presses play,
 * so the poster stays the LCP candidate and Lighthouse is unaffected by the component (TKT-18 AC4).
 */
import { useCallback, useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { AlertTriangle, Film, Loader2, Play } from "lucide-react";
import type { Media, Project } from "@/data/schema";
import { Icon } from "@/components/common/Icon";
import { VisuallyHidden } from "@/components/common/VisuallyHidden";

/**
 * TKT-90a: the paper secondary control (same pill as `app/not-found.tsx`'s "See the work": ivory,
 * hairline `--line` border, `--shadow-paper`) — replaces the retired clay secondary button.
 * ≥ 44×44 target; the 1 px lift collapses under reduced motion.
 */
const PAPER_BUTTON =
  "focus-ring inline-flex min-h-11 min-w-11 items-center justify-center gap-[var(--space-2)] rounded-[var(--radius-pill)] border border-[var(--line)] bg-ivory text-navy shadow-[var(--shadow-paper)] transition-transform duration-150 ease-out hover:-translate-y-px motion-reduce:hover:translate-y-0";

export type DemoVideoData = NonNullable<Project["links"]["demoVideo"]>;

export type DemoVideoPhase = "no-video" | "idle" | "loading" | "playing" | "error";

export interface DemoVideoProps {
  /** `project.links.demoVideo` — absent means `no-video` (the real state for every project until
   *  M-005 supplies files). */
  video?: DemoVideoData | undefined;
  /** Shown behind the "Demo coming" badge in the `no-video` state (e.g. `project.hero.image`).
   *  A `kind:'placeholder'` (or missing) fallback renders the flat placeholder tile instead of an
   *  `<img>` — never a broken image (A13). */
  posterFallback?: Media | undefined;
  /** The project's live URL — powers the `error` overlay's "View live →" fallback. */
  liveUrl?: string | undefined;
  /** Project name — used for the play button's accessible name ("Play demo: {name}") and poster alt. */
  name: string;
  /** Pass when this instance is the above-the-fold LCP candidate (Design.md §3 poster/lazy). Off
   *  by default — most instances (work-grid cards) are below the fold. */
  priority?: boolean | undefined;
  /** `next/image` `sizes`; override when the consumer's layout width is known and narrower. */
  sizes?: string | undefined;
  className?: string | undefined;
}

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

const DEFAULT_SIZES = "(min-width: 1024px) 50vw, 100vw";

export function DemoVideo({
  video,
  posterFallback,
  liveUrl,
  name,
  priority = false,
  sizes = DEFAULT_SIZES,
  className,
}: DemoVideoProps) {
  const [phase, setPhase] = useState<DemoVideoPhase>(video ? "idle" : "no-video");
  const [intent, setIntent] = useState(false);
  const autoplayOnMount = useRef(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const errorHeadingId = useId();

  // IO + pointer:fine auto-intent (technical-plan.md §B TKT-18): only reveals the native player
  // early on desktop cursor devices once half the component is in view — it never autoplays, and
  // never runs at all for `no-video`, once intent is already given, or when IO/matchMedia are
  // unavailable (SSR / very old browsers just fall back to click-to-intent).
  useEffect(() => {
    if (!video || intent) return;
    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const node = containerRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIntent(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [video, intent]);

  // Runs once per intent flip. A click sets `autoplayOnMount` first, so once the just-mounted
  // <video> ref is attached this starts playback immediately; an IO-revealed mount leaves it unset
  // and waits for the user's own press on the native controls.
  useEffect(() => {
    if (!intent || !autoplayOnMount.current) return;
    autoplayOnMount.current = false;
    videoRef.current?.play().catch((err: unknown) => {
      // A real network/decode failure already flips to `error` via onError below; this only
      // catches browser-policy rejections (e.g. a blocked programmatic play) that onError would
      // never fire for — still never swallowed silently (A12).
      console.warn("[video]", err);
    });
  }, [intent]);

  const handlePlayClick = useCallback(() => {
    autoplayOnMount.current = true;
    setPhase("loading");
    setIntent(true);
  }, []);

  const handleError = useCallback(() => {
    console.warn("[video]", videoRef.current?.error ?? new Error("demo video failed to load"));
    setPhase("error");
  }, []);

  const handleLoadStart = useCallback(() => {
    setPhase((current) => (current === "error" ? current : "loading"));
  }, []);

  const handlePlaying = useCallback(() => {
    setPhase("playing");
  }, []);

  if (!video) {
    const showImage = posterFallback && posterFallback.kind !== "placeholder";
    return (
      <div
        ref={containerRef}
        data-video-state="no-video"
        className={["relative h-full w-full overflow-hidden bg-ivory", className].filter(Boolean).join(" ")}
      >
        {showImage && posterFallback ? (
          <Image src={posterFallback.src} alt={posterFallback.alt} fill sizes={sizes} className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-navy/5">
            <Icon icon={Film} size={24} className="text-ink-soft" />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-navy/30">
          <span className="inline-flex items-center gap-[var(--space-2)] rounded-[var(--radius-paper)] bg-ivory px-[var(--space-4)] py-[var(--space-2)] text-caption font-semibold text-navy">
            <Icon icon={Film} size={20} />
            Demo coming
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      data-video-state={phase}
      className={["relative h-full w-full overflow-hidden bg-ivory", className].filter(Boolean).join(" ")}
    >
      {intent ? (
        // No caption track: these are silent, muted product-demo clips — nothing spoken to transcribe.
        <video
          ref={videoRef}
          src={video.src}
          poster={video.poster}
          preload="none"
          muted
          playsInline
          controls
          className="h-full w-full object-cover"
          onLoadStart={handleLoadStart}
          onWaiting={handleLoadStart}
          onPlaying={handlePlaying}
          onError={handleError}
        />
      ) : (
        <Image src={video.poster} alt={`${name} demo preview`} fill sizes={sizes} priority={priority} className="object-cover" />
      )}

      {!intent ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            type="button"
            aria-label={`Play demo: ${name}`}
            onClick={handlePlayClick}
            className={`${PAPER_BUTTON} h-14 w-14`}
          >
            <Icon icon={Play} size={24} />
          </button>
        </div>
      ) : null}

      {phase === "loading" ? (
        <div role="status" aria-busy="true" className="pointer-events-none absolute inset-0 flex items-center justify-center bg-navy/40">
          <VisuallyHidden>Loading demo video</VisuallyHidden>
          <Icon icon={Loader2} size={24} className="animate-spin text-ivory motion-reduce:animate-none" />
        </div>
      ) : null}

      {phase === "error" ? (
        <div
          role="alert"
          aria-labelledby={errorHeadingId}
          className="absolute inset-0 flex flex-col items-center justify-center gap-[var(--space-3)] bg-steel/90 p-[var(--space-4)] text-center text-navy"
        >
          <Icon icon={AlertTriangle} size={24} />
          <p id={errorHeadingId} className="text-caption font-semibold">
            Couldn&apos;t load the demo video.
          </p>
          {liveUrl ? (
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${PAPER_BUTTON} px-[var(--space-5)] font-semibold`}
            >
              View live
              <VisuallyHidden>(opens in new tab)</VisuallyHidden>
            </a>
          ) : (
            <span className="inline-flex items-center rounded-[var(--radius-paper)] bg-ivory px-[var(--space-4)] py-[var(--space-2)] text-caption font-semibold text-navy">
              Demo coming
            </span>
          )}
        </div>
      ) : null}

      {phase !== "error" ? (
        <span className="pointer-events-none absolute bottom-[var(--space-2)] right-[var(--space-2)] rounded-[var(--radius-paper)] bg-navy/60 px-[var(--space-2)] py-[2px] text-caption text-ivory">
          {formatDuration(video.durationSec)}
        </span>
      ) : null}
    </div>
  );
}
