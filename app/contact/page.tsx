import type { Metadata } from "next";
import { ContactSection } from "@/components/contact/ContactSection";
import { SceneOpener } from "@/components/paper/SceneOpener";
import { buildMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: `Contact · ${site.name}`,
  description: "Email, LinkedIn, or a resume — the fastest ways to reach Tushar Pathak.",
  path: "/contact",
  ogFamily: "Contact",
});

/**
 * `/contact` (TSK-46 → TASK-113, Design.md §7.8): TKT-95's scene opener (EXE-18) → `ContactSection`
 * (`section#contact` — Tushar's 2026-09-27 scrapbook last page: visual story + one contact card) →
 * band (layout). Static — no client data-fetching (TP1); the client islands are `CopyButton` and the
 * CSS entrance trigger `ContactEntrance`. `buildMetadata`/OG family unchanged.
 */
export default function ContactPage() {
  return (
    <>
      {/* TKT-95 scene opener (EXE-18), sized like the home banner (TKT-107, Dev-95) — focal point per scene in components/paper/scene-opener-frames.ts. */}
      <SceneOpener id="scene-contact" priority />
      <ContactSection />
    </>
  );
}
