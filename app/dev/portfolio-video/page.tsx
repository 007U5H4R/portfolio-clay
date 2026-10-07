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

// The fixture states every product's videos explicitly instead of inheriting real ones: product 2 is pitch-only and
// product 3 has none, whatever data/portfolio.ts carries (RailCite and TeachSpark have real demos — TASK-125/170).
const withoutVideos = <T extends { pitchVideo?: unknown; demoVideo?: unknown }>(product: T): T => {
  const rest = { ...product };
  delete rest.pitchVideo;
  delete rest.demoVideo;
  return rest;
};

const products = real.map((product, index) => {
  if (index === 0) {
    return {
      ...product,
      pitchVideo: resolveVideoMedia({ provider: "youtube", videoId: FIXTURE_YOUTUBE_ID }, product.name, "pitch"),
      demoVideo: resolveVideoMedia({ provider: "youtube", videoId: FIXTURE_YOUTUBE_ID_2 }, product.name, "demo"),
    };
  }
  if (index === 1) {
    return { ...withoutVideos(product), pitchVideo: resolveVideoMedia({ provider: "youtube", videoId: FIXTURE_YOUTUBE_ID_2 }, product.name, "pitch") };
  }
  if (index === 2) return withoutVideos(product);
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
