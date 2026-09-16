import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { buildMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: `Contact · ${site.name}`,
  description: "Email, LinkedIn, or a resume — the fastest ways to reach Tushar Pathak.",
  path: "/contact",
  ogFamily: "Contact",
});

/**
 * Tracer stub. The `#resume` section exists so the resume control's `/contact#resume` target
 * resolves (PB5) while a sanitised resume PDF does not yet exist (TKT-08). `scroll-mt-32` keeps
 * the section clear of the sticky header when deep-linked.
 */
export default function ContactPage() {
  return (
    <Container as="section" className="py-32">
      <h1 className="text-[length:var(--text-h2)] font-extrabold tracking-[var(--tracking-hero)] text-ink">
        Contact
      </h1>

      <section id="resume" className="mt-10 scroll-mt-32">
        <h2 className="text-[length:var(--text-h3)] font-bold text-ink">Resume</h2>
        <p className="mt-3 max-w-[60ch] text-[length:var(--text-lead)] text-ink-2">
          A sanitised resume is on the way. In the meantime,{" "}
          <a className="font-semibold text-accent underline focus-ring" href={`mailto:${site.email}`}>
            email me
          </a>{" "}
          for a copy.
        </p>
      </section>
    </Container>
  );
}
