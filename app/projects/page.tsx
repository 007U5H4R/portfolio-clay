import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Annotation } from "@/components/paper";
import { SceneOpener } from "@/components/paper/SceneOpener";
import { EnterpriseClientWork } from "@/components/portfolio/EnterpriseClientWork";
import { IndependentProductsShowcase } from "@/components/portfolio/IndependentProductsShowcase";
import { PortfolioIntro } from "@/components/portfolio/PortfolioIntro";
import { enterpriseCases } from "@/data/enterprise";
import { portfolioEntries } from "@/data/portfolio";
import { projects } from "@/data/projects";
import { illustration, type IllustrationId } from "@/lib/illustrations";
import { buildPortfolioProducts } from "@/lib/portfolio";
import { buildMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: `Portfolio · ${site.name}`,
  description:
    "Products Tushar built, tested and shipped on his own, plus the enterprise cloud, data, healthcare and ML programs he delivered inside larger systems.",
  path: "/projects",
  ogFamily: "Portfolio",
});

/**
 * `/projects` — the Portfolio page (TASK-116, Tushar's spec 2026-09-28; route kept stable, spec §1).
 *
 *   SceneOpener (`scene-work`, TKT-95 / EXE-18 — every page opens with its own scene)
 *   section#products   PortfolioIntro + IndependentProductsShowcase (media stage · product panel ·
 *                      90s carousel) — expressive, interactive (spec §5–§24)
 *   section#enterprise EnterpriseClientWork — torn seam onto dossier paper, six case files (§25–§42)
 *
 * Static by construction (TP1): the showcase reads `?product=` on the client after mount, so the
 * prerendered HTML carries the default product and every carousel cover.
 *
 * EVAL-018 (Design.md §3.3): products = underline sketch · "choose your build" annotation = 2 decorations;
 * enterprise = torn · "inside larger systems" annotation = 2.
 */
const products = buildPortfolioProducts(projects, portfolioEntries, (id) => {
  const entry = illustration(id as IllustrationId);
  if (!entry.publicSrc) throw new Error(`portfolio: cover art "${id}" has no publicSrc`);
  return { src: entry.publicSrc, width: entry.width, height: entry.height, alt: entry.alt };
});

export default function ProjectsPage() {
  return (
    <>
      <SceneOpener id="scene-work" priority />
      <section id="products" className="pf-products" aria-labelledby="portfolio-h">
        <Container className="pf-products-wrap">
          <PortfolioIntro />
          <Annotation arrow="down" rotate={-3} className="pf-select-note">
            choose your build
          </Annotation>
          <IndependentProductsShowcase products={products} />
        </Container>
      </section>
      <EnterpriseClientWork cases={enterpriseCases} />
    </>
  );
}
