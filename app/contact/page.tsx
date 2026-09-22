import type { Metadata } from "next";
import { ContactCard } from "@/components/contact/ContactCard";
import { Section } from "@/components/layout/Section";
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
    <Section id="contact" aria-label="Contact">
      <ContactCard />
    </Section>
  );
}
