import type { Metadata } from "next";
import { ContactCard } from "@/components/contact/ContactCard";
import { ContactDetails } from "@/components/contact/ContactDetails";
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
 * `/contact` (TSK-46, Design.md §7.8): TKT-95's scene opener (EXE-18) → `ContactCard` (the opener
 * copy + actions list, `section#contact`) → `ContactDetails` (the postcard on `paper-2`, torn) →
 * band (layout). Static — no client data-fetching (TP1); the only client island is `CopyButton`.
 * `buildMetadata`/OG family unchanged (`app/contact/opengraph-image.tsx` untouched).
 */
export default function ContactPage() {
  return (
    <>
      {/* TKT-95 scene opener (EXE-18): a portrait (1638×2048) in a wide box shows ≈ 26 % of its height
          ≥ 768 — focalY 0.2 keeps the full head, the face and the waving fingers; the mug and most of
          the palm fall below the crop (< 768 the taller 3:2 box shows ≈ 53 %: face + whole wave). */}
      <SceneOpener id="scene-contact" focalX={0.5} focalY={0.1} priority />
      <ContactCard />
      <ContactDetails />
    </>
  );
}
