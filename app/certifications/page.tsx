import type { Metadata } from "next";
import { CertificationTimeline } from "@/components/certifications/CertificationTimeline";
import { MoreCredentials } from "@/components/certifications/MoreCredentials";
import { featuredCertifications, otherCertifications } from "@/data/certifications";
import { buildMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: `Certifications · ${site.name}`,
  description:
    "Credly-verified certifications — Google Cloud Generative AI Leader, PMP, SAFe Agilist, Professional Cloud Architect, PSPO I and more — each linked to its credential, with where it was applied.",
  path: "/certifications",
  ogFamily: "Certifications",
});

/**
 * `/certifications` (TKT-102, Tushar direction 2026-09-26; Design.md §11 Dev-46/47). No scene
 * opener: his reference starts at the torn "Certifications" title strip and no page scene exists for
 * it (no new generated imagery) — the page opens directly on the collage timeline, as `/work` does
 * (TKT-101). Timeline (the five annotated certifications) → "More on Credly" (every other badge).
 * All credential data comes from `data/certifications.ts` (Credly); each card links to its own
 * credential. Server-rendered and statically prerendered (TP1); the only client JS is the click
 * tracking inside `CredentialLink`.
 */
export default function CertificationsPage() {
  return (
    <div className="certs">
      <CertificationTimeline certifications={featuredCertifications} />
      <MoreCredentials certifications={otherCertifications} />
    </div>
  );
}
