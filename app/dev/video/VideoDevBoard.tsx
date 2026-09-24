"use client";

/**
 * VideoDevBoard (technical-plan.md §B TKT-18) — the client half of the QA-only `/dev/video` fixture
 * board. Renders four labelled `DemoVideo` instances, one per EVAL-014 case:
 *
 *   no-video       → no `video` prop at all, with a real poster fallback image.
 *   valid          → `src` points at `/dev-fixtures/video/valid.mp4`, a path that does not exist on
 *                    disk (no video binary is committed — M-005 supplies real files). Under
 *                    `tests/e2e/eval-014.spec.ts` this request is intercepted with a tiny
 *                    ffmpeg-generated fixture (generated at test time into the gitignored `.eval/`
 *                    dir, never committed) after a short delay, so the test observes `loading` then
 *                    `playing`. Opened by hand (no interception running) the request genuinely
 *                    404s, which is itself a correct — if less illustrative — rendering of the
 *                    `error` state.
 *   error-404      → `src` points at another nonexistent path; with no interception this is a real,
 *                    honest 404 → `error` in both the test and a manual browser.
 *   error-throttled→ `src` points at a third nonexistent path that the e2e spec intercepts with an
 *                    artificial delay before aborting the connection, exercising the
 *                    "slow network that ultimately fails" path distinct from an immediate 404.
 *
 * Each `<video>` only mounts on explicit intent (click), never on IO/pointer-fine here — a QA board
 * has every fixture in view at once, so IO auto-reveal would defeat the "no <video> before intent"
 * assertion the e2e spec makes against the untouched fixtures.
 */
import type { ReactNode } from "react";
import { DemoVideo, type DemoVideoData } from "@/components/projects/DemoVideo";

const NO_VIDEO_POSTER = {
  src: "/avatar/avatar.webp",
  alt: "Placeholder poster image reused from the site avatar for this QA fixture",
  width: 1800,
  height: 2250,
  kind: "image" as const,
};

const VALID_FIXTURE: DemoVideoData = {
  src: "/dev-fixtures/video/valid.mp4",
  poster: "/avatar/avatar.webp",
  durationSec: 12,
};

const ERROR_404_FIXTURE: DemoVideoData = {
  src: "/dev-fixtures/video/missing.mp4",
  poster: "/avatar/avatar.webp",
  durationSec: 9,
};

const ERROR_THROTTLED_FIXTURE: DemoVideoData = {
  src: "/dev-fixtures/video/throttled.mp4",
  poster: "/avatar/avatar.webp",
  durationSec: 20,
};

function Fixture({
  fixture,
  title,
  children,
}: {
  fixture: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section data-fixture={fixture} className="flex flex-col gap-[var(--space-3)]">
      <h2 className="text-h3 text-navy">{title}</h2>
      <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-[var(--radius-clay-sm)] shadow-[var(--shadow-clay-rest)]">
        {children}
      </div>
    </section>
  );
}

export function VideoDevBoard() {
  return (
    <main className="min-h-screen bg-paper px-[var(--gutter-mobile)] py-[var(--space-9)] text-navy md:px-[var(--gutter-tablet)]">
      <header className="mb-[var(--space-8)]">
        <p className="text-caption uppercase tracking-[var(--tracking-eyebrow)] text-ink-soft">
          Dev board · QA only
        </p>
        <h1 className="text-h2">DemoVideo states (EVAL-014)</h1>
      </header>

      <div className="flex flex-col gap-[var(--space-8)]">
        <Fixture fixture="no-video" title="no-video — no demoVideo data">
          <DemoVideo name="No Video Fixture" posterFallback={NO_VIDEO_POSTER} />
        </Fixture>

        <Fixture fixture="valid" title="idle → loading → playing — valid src">
          <DemoVideo name="Valid Fixture" video={VALID_FIXTURE} liveUrl="https://example.com" />
        </Fixture>

        <Fixture fixture="error-404" title="idle → loading → error — 404 src">
          <DemoVideo name="404 Fixture" video={ERROR_404_FIXTURE} liveUrl="https://example.com" />
        </Fixture>

        <Fixture fixture="error-throttled" title="idle → loading → error — throttled/aborted src">
          <DemoVideo name="Throttled Fixture" video={ERROR_THROTTLED_FIXTURE} />
        </Fixture>
      </div>
    </main>
  );
}
