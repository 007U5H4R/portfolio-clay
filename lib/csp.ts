import { frameSources, type VideoProvider } from "./video-providers";

/**
 * The Content-Security-Policy (decision TP9; rationale for each directive in `next.config.ts`).
 * Lives here so the policy is unit-testable (`tests/unit/csp.test.ts`) and so `frame-src` is DERIVED
 * from the video providers the product data actually uses (TASK-122, video-embed spec §9, §18, §19).
 *
 * frame-src:
 *   - `https://www.youtube-nocookie.com` always — YouTube is the chosen host for every pitch/demo.
 *   - `https://player.vimeo.com` only while some product's pitch/demo uses Vimeo (§18: no unused
 *     permission). Switching a product to Vimeo in `data/portfolio.ts` adds it at the next build.
 *   - no `'self'`: nothing on the site frames a same-origin page, and every route already sends
 *     `frame-ancestors 'none'` + `X-Frame-Options: DENY`, so a same-origin frame would be refused.
 *   - never `*`, never `https://www.youtube.com` (the tracking-cookie host).
 */
export function buildCsp(usedProviders: Iterable<VideoProvider>): string {
  const frameSrc = frameSources(["youtube", ...usedProviders]);
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "media-src 'self'",
    `frame-src ${frameSrc.join(" ")}`,
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

/** Every provider a set of portfolio entries uses for a pitch or demo video. */
export function providersInUse(
  entries: readonly { pitchVideo?: { provider: VideoProvider } | undefined; demoVideo?: { provider: VideoProvider } | undefined }[],
): VideoProvider[] {
  const used = new Set<VideoProvider>();
  for (const entry of entries) {
    if (entry.pitchVideo) used.add(entry.pitchVideo.provider);
    if (entry.demoVideo) used.add(entry.demoVideo.provider);
  }
  return [...used];
}
