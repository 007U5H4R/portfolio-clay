import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { buildMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: `Work · ${site.name}`,
  description: "Every project — personal AI builds and professional platform work — filterable by AI, Enterprise, Cloud and Experiments.",
  path: "/work",
  ogFamily: "Selected Work",
});

/** Tracer stub so the hero's "View My Work →" CTA is never a dead link (S05.05). Fleshed out in TKT-16. */
export default function WorkPage() {
  return (
    <Container as="section" className="py-32">
      <h1 className="text-[length:var(--text-h2)] font-extrabold tracking-[var(--tracking-hero)] text-ink">
        Work
      </h1>
      <p className="mt-4 text-[length:var(--text-lead)] text-ink-2">Work — coming in this build</p>
    </Container>
  );
}
