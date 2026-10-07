"use client";

export interface LcpHint {
  href: string;
  media: string;
  high: boolean;
}

/**
 * Renders `<link rel="preload" as="image">` hints for a scene's LCP layers (TASK-155). A client component on purpose:
 * see `lcpHints` in PaperParallaxScene.tsx — a server-rendered hint is replayed by every nav prefetch (TASK-149).
 * React hoists these links into the page's `<head>` during SSR; nothing is rendered in the body.
 */
export function LcpPreloads({ hints }: { hints: LcpHint[] }) {
  return (
    <>
      {hints.map((h) => (
        <link key={h.href + h.media} rel="preload" as="image" type="image/webp" href={h.href} media={h.media} fetchPriority={h.high ? "high" : undefined} />
      ))}
    </>
  );
}
