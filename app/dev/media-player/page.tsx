import { devOnly } from "@/lib/dev-only";
import { ProductMediaPlayer } from "@/components/portfolio/ProductMediaPlayer";
import { FIXTURE_PITCH } from "./fixtures";

/**
 * /dev/media-player (TASK-122) — QA-only board for `ProductMediaPlayer` with a test-only YouTube id
 * (`tests/e2e/media-player.spec.ts`). 404s in a normal production build; renders under
 * `ALLOW_DEV_ROUTES=1`. Static (reads no `searchParams`); excluded from the sitemap. The player sits
 * in the Portfolio stage's own `pf-stage-screen` box so it wears the real 16:9 frame styles.
 */
export default function MediaPlayerDevPage() {
  devOnly();
  return (
    <div className="min-h-screen bg-paper px-[var(--gutter-mobile)] py-[var(--space-9)] text-navy md:px-[var(--gutter-tablet)]">
      <h1 className="mb-6 text-2xl">ProductMediaPlayer fixture</h1>
      <div style={{ maxWidth: 960 }}>
        <ProductMediaPlayer
          id="fixture-player"
          className="pf-stage-screen"
          media={FIXTURE_PITCH}
          fallbackPoster={<div aria-hidden="true" style={{ background: "var(--color-kraft)" }} />}
        />
      </div>
    </div>
  );
}
