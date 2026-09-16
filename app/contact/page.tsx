import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { ClayButton } from "@/components/clay/ClayButton";
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
 *
 * EXE-7 / EVAL-008: the "email me" action is a real CTA (not running-text), so it gets the
 * `ClayButton` ≥44×44 target floor rather than an inline-link exception — it renders on its own
 * line below the sentence instead of inline in it.
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
          A sanitised resume is on the way. In the meantime, email me for a copy.
        </p>
        <div className="mt-4">
          <ClayButton href={`mailto:${site.email}`} variant="secondary">
            Email me
          </ClayButton>
        </div>
      </section>
    </Container>
  );
}
