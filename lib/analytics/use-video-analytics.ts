"use client";

import { useEffect, useRef, type RefObject } from "react";
import { track } from "./track";

export interface VideoAnalyticsTarget {
  projectId: string;
  videoType: "pitch" | "demo";
  provider: "youtube" | "vimeo";
  /** The privacy-enhanced player origin messages must come from. */
  origin: string;
}

// Build-time constant: with no token the whole hook body is dead code.
const ENABLED = !!process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;

/** The milestone logic is a lazy chunk (kept out of `/projects` first-load JS); warmed on mount, long before Play. */
const loadProgress = () => import("./video-progress");

/**
 * Listens to the embedded player's own postMessage reports (the same channel the ready handshake uses —
 * no SDK, no new host) and turns them into `project_video_started` / `project_video_progressed`. Active
 * only while a frame is mounted. Vimeo is not instrumented: no product uses it and its player API is not
 * exercised here, so a Vimeo video reports nothing rather than a guess (docs/analytics.md, limitations).
 */
export function useVideoAnalytics(frameRef: RefObject<HTMLIFrameElement | null>, active: boolean, target: VideoAnalyticsTarget): void {
  const targetRef = useRef(target);
  useEffect(() => {
    targetRef.current = target;
  });

  // Warm the chunk while the poster is showing (idle, once per player).
  useEffect(() => {
    if (!ENABLED || target.provider !== "youtube" || !target.projectId) return;
    const id = window.setTimeout(() => void loadProgress().catch(() => undefined), 1500);
    return () => window.clearTimeout(id);
  }, [target.provider, target.projectId]);

  useEffect(() => {
    if (!ENABLED || !active || target.provider !== "youtube") return;
    let cancelled = false;
    let detach: (() => void) | undefined;
    void loadProgress()
      .then(({ VideoProgress, readYouTubeSample }) => {
        if (cancelled) return;
        const progress = new VideoProgress();
        let subscribed = false;
        const onMessage = (event: MessageEvent) => {
          const frame = frameRef.current;
          if (!frame || event.origin !== targetRef.current.origin || event.source !== frame.contentWindow) return;
          if (!subscribed) {
            // YouTube's documented iframe protocol: ask the (already listening) player to push state changes.
            subscribed = true;
            frame.contentWindow?.postMessage(JSON.stringify({ event: "command", func: "addEventListener", args: ["onStateChange"], id: 1, channel: "widget" }), targetRef.current.origin);
          }
          const sample = readYouTubeSample(event.data);
          if (!sample) return;
          const { projectId, videoType } = targetRef.current;
          for (const signal of progress.update(sample, performance.now())) {
            if (signal.type === "started") track("project_video_started", { project_id: projectId, video_type: videoType });
            else track("project_video_progressed", { project_id: projectId, video_type: videoType, progress_percent: signal.percent });
          }
        };
        window.addEventListener("message", onMessage);
        detach = () => window.removeEventListener("message", onMessage);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
      detach?.();
    };
  }, [active, frameRef, target.provider]);
}
