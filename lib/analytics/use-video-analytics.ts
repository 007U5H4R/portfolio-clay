"use client";

import { useEffect, useRef, type RefObject } from "react";
import { track } from "./track";
import { VideoProgress, readYouTubeSample } from "./video-progress";

export interface VideoAnalyticsTarget {
  projectId: string;
  videoType: "pitch" | "demo";
  provider: "youtube" | "vimeo";
  /** The privacy-enhanced player origin messages must come from. */
  origin: string;
}

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

  useEffect(() => {
    if (!active || target.provider !== "youtube") return;
    const progress = new VideoProgress();
    const onMessage = (event: MessageEvent) => {
      const frame = frameRef.current;
      if (!frame || event.origin !== targetRef.current.origin || event.source !== frame.contentWindow) return;
      const sample = readYouTubeSample(event.data);
      if (!sample) return;
      const { projectId, videoType } = targetRef.current;
      for (const signal of progress.update(sample, performance.now())) {
        if (signal.type === "started") track("project_video_started", { project_id: projectId, video_type: videoType });
        else track("project_video_progressed", { project_id: projectId, video_type: videoType, progress_percent: signal.percent });
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [active, frameRef, target.provider]);
}
