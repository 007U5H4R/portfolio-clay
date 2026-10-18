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
