import { Container } from "@/components/layout/Container";
import { devOnly } from "@/lib/dev-only";
import { IndependentProductsShowcase } from "@/components/portfolio/IndependentProductsShowcase";
import { portfolioEntries } from "@/data/portfolio";
import { projects } from "@/data/projects";
import { illustration, type IllustrationId } from "@/lib/illustrations";
import { buildPortfolioProducts, resolveVideoMedia } from "@/lib/portfolio";
import { FIXTURE_YOUTUBE_ID, FIXTURE_YOUTUBE_ID_2 } from "../media-player/fixtures";

/**
 * /dev/portfolio-video (TASK-122) — QA-only: the REAL Portfolio showcase (TASK-121 visuals) built from
 * the real product data, with TEST-ONLY YouTube ids overlaid on the first product (pitch + demo) and
 * the second (pitch only), so `tests/e2e/portfolio-video.spec.ts` can prove Pitch ↔ Demo remounts and
 * product changes reset — while `data/portfolio.ts` itself carries no ids. 404s in a normal
 * production build; renders under `ALLOW_DEV_ROUTES=1`. Static; excluded from the sitemap.
 */
const real = buildPortfolioProducts(projects, portfolioEntries, (id) => {
  const entry = illustration(id as IllustrationId);
  if (!entry.publicSrc) throw new Error(`portfolio: cover art "${id}" has no publicSrc`);
  return { src: entry.publicSrc, width: entry.width, height: entry.height, alt: entry.alt };
});

const products = real.map((product, index) => {
  if (index === 0) {
    return {
      ...product,
      pitchVideo: resolveVideoMedia({ provider: "youtube", videoId: FIXTURE_YOUTUBE_ID }, product.name, "pitch"),
      demoVideo: resolveVideoMedia({ provider: "youtube", videoId: FIXTURE_YOUTUBE_ID_2 }, product.name, "demo"),
    };
  }
  if (index === 1) {
    return { ...product, pitchVideo: resolveVideoMedia({ provider: "youtube", videoId: FIXTURE_YOUTUBE_ID_2 }, product.name, "pitch") };
  }
  return product;
});

export default function PortfolioVideoDevPage() {
  devOnly();
  return (
    <section id="products" className="pf-products" aria-label="Portfolio video fixture">
      <Container className="pf-products-wrap">
        <IndependentProductsShowcase products={products} />
      </Container>
    </section>
  );
}
