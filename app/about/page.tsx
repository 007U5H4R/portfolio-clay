import type { Metadata } from "next";
import "../styles/about.css";
import "../styles/about__work.css";
import "../styles/about__home.css";
import { AboutCta } from "@/components/about/AboutCta";
import { AboutHero } from "@/components/about/AboutHero";
import { BuildersDesk } from "@/components/about/BuildersDesk";
import { CareerContexts } from "@/components/about/CareerContexts";
import { ResearchValues } from "@/components/about/ResearchValues";
import { Testimonials } from "@/components/about/Testimonials";
import { ThreeChapters } from "@/components/about/ThreeChapters";
import { AwardsSection } from "@/components/home/HomeSections";
import { SceneOpener } from "@/components/paper/SceneOpener";
import { buildMetadata, siteUrl } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: `About Tushar Pathak · AI Product Leader in Bengaluru`,
  description:
    "Meet Tushar Pathak, a Senior Product Manager and AI Product Leader in Bengaluru, India. Explore his work across enterprise AI, product strategy, cloud platforms, data and independent products.",
  path: "/about",
});

/**
 * ProfilePage structured data helps search engines associate this page with the
 * person it describes. It describes identity; it does not claim a ranking or endorsement.
 */
function ProfileStructuredData() {
  const base = siteUrl();
  const personId = `${base}/#person`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${base}/about#profile`,
    "url": `${base}/about`,
    "name": "About Tushar Pathak",
    "mainEntity": {
      "@type": "Person",
      "@id": personId,
      "name": "Tushar Pathak",
      "url": base,
      "jobTitle": "Senior Product Manager",
      "description": site.tagline,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Bengaluru",
        "addressRegion": "Karnataka",
        "addressCountry": "IN"
      },
      "sameAs": [site.linkedin, site.github],
      "knowsAbout": [
        "Product Management",
        "AI Product Management",
        "Enterprise Artificial Intelligence",
        "Generative AI",
        "Large Language Models",
        "AI Agents",
        "Product Strategy",
        "Cloud Platforms",
        "Data Engineering"
      ]
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
    />
  );
}

/**
 * /about — WHO Tushar is. Employer-by-employer roles, dates, bullets and outcomes live on /work;
 * credentials live on /certifications.
 */
export default function AboutPage() {
  return (
    <>
      <ProfileStructuredData />
      <SceneOpener id="scene-about" priority />
      <AboutHero />
      <BuildersDesk />
      <ThreeChapters />
      <CareerContexts />
      <ResearchValues />
      <AwardsSection id="recognition" />
      <Testimonials />
      <AboutCta />
    </>
  );
}
