import { ClipboardList, FileText, Rocket, Video, type LucideIcon } from "lucide-react";
import { GithubMark } from "./GithubMark";

export type ActionIcon = LucideIcon | typeof GithubMark;

/** TASK-256 (Tushar 2026-10-18) destination → icon: demo = video camera, live = rocket, GitHub = mark, case study = document, PRD = checklist (distinct from the case study). */
export const ACTION_ICON: Record<"demo" | "product" | "github" | "case" | "prd", ActionIcon> = {
  demo: Video,
  product: Rocket,
  github: GithubMark,
  case: FileText,
  prd: ClipboardList,
};

/**
 * TASK-301 (Tushar 2026-10-20): the five main actions carry a sculpted origami icon instead of a line glyph. Masters + provenance:
 * public/media/illustrations/origami-icons/README.md. `-128` is the secondary-size file, the bare name the primary one.
 */
export type OrigamiKey = "play" | "camera" | "rocket" | "cat" | "document";
export const ORIGAMI_FOR_ACTION: Record<string, OrigamiKey | undefined> = {
  demo: "play",
  pitch: "camera",
  product: "rocket",
  github: "cat",
  case: "document",
};
