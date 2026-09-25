import type { Metadata } from "next";
import { ContactCard } from "@/components/contact/ContactCard";
import { Section } from "@/components/layout/Section";
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
 * `/contact` (TKT-45, M-006): extends the M-002 tracer stub into the real `ContactCard` — no
 * second route, no change to the `buildMetadata`/OG family TKT-06 already wired (verified
 * unchanged above; `app/contact/opengraph-image.tsx` is untouched). Static — same discipline as
 * every other route (TP1), no client data-fetching.
 */
export default function ContactPage() {
  return (
    <>
      {/* TKT-95 scene opener (EXE-18): a portrait (1638×2048) in a wide box shows ≈ 26 % of its height
          ≥ 768 — focalY 0.2 keeps the full head, the face and the waving fingers; the mug and most of
          the palm fall below the crop (< 768 the taller 3:2 box shows ≈ 53 %: face + whole wave). */}
      <SceneOpener id="scene-contact" focalX={0.5} focalY={0.1} priority />
      <Section id="contact" aria-label="Contact">
        <ContactCard />
      </Section>
    </>
  );
}
