import { MessageSquareText, type LucideIcon } from "lucide-react";
import type { ProjectStatus } from "@/components/projects/StatusBadge";

/**
 * Tracer content — the single TeachSpark featured card that drives the M-001 home → case-study
 * path end-to-end. Copy is VERBATIM from CONTENT_INVENTORY.md §1.4 / §2.2 (name, proposition,
 * tags) and the S06.03 literal (status, statusLabel) — do not paraphrase. Real, schema-validated
 * content for all featured cards lands in TKT-12.
 */
export interface FeaturedProject {
  slug: string;
  name: string;
  /** One-sentence proposition (rendered `line-clamp-2` on the card, and as the case-study lead). */
  proposition: string;
  tags: string[];
  status: ProjectStatus;
  statusLabel: string;
  icon: LucideIcon;
}

export const teachspark: FeaturedProject = {
  slug: "teachspark",
  name: "TeachSpark",
  proposition:
    "A WhatsApp bot that helps a time-poor Indian K–12 teacher use AI for real classroom work.",
  tags: ["AI", "WhatsApp", "EdTech"],
  status: "pilot",
  statusLabel: "Live pilot — uptime unverified since 2026-09-09",
  icon: MessageSquareText,
};

export const featuredProjects: readonly FeaturedProject[] = [teachspark];

export function getFeaturedProject(slug: string): FeaturedProject | undefined {
  return featuredProjects.find((project) => project.slug === slug);
}
