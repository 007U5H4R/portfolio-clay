import type { Metadata } from "next";
import { CertificationTimeline } from "@/components/certifications/CertificationTimeline";
import { MoreCredentials } from "@/components/certifications/MoreCredentials";
import { SceneOpener } from "@/components/paper/SceneOpener";
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
 * `/certifications` (TKT-102, Tushar direction 2026-09-26; Design.md §11 Dev-46/47). Since TASK-114
 * (Tushar 2026-09-27, Design.md §11 Dev-98, superseding the TKT-102 "no scene opener") the page opens on
 * its own scene, `scene-certifications`, in the shared `SceneOpener` — sized, cropped and parallaxed like
 * every other tab's — with the torn "Certifications" title strip directly below it.
 * Opener → timeline (the five annotated certifications) → "More on Credly" (every other badge).
 * All credential data comes from `data/certifications.ts` (Credly); each card links to its own
 * credential. Server-rendered and statically prerendered (TP1); the only client JS is the click
 * tracking inside `CredentialLink`.
 */
export default function CertificationsPage() {
  return (
    <>
      {/* TASK-114 scene opener (Dev-98): the first child of <main>, as on every other tab. */}
      <SceneOpener id="scene-certifications" priority />
      <div className="certs">
        <CertificationTimeline certifications={featuredCertifications} />
        <MoreCredentials certifications={otherCertifications} />
      </div>
    </>
  );
}
