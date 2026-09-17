import { devOnly } from "@/lib/dev-only";
import { ArtifactRenderer } from "@/components/case-study/artifacts/ArtifactRenderer";
import { ArtifactGrid } from "@/components/case-study/artifacts/ArtifactGrid";
import { ARTIFACTS, SOURCES } from "./fixtures";

/**
 * /dev/artifacts (TKT-20) — the QA-only board that renders every `Artifact` variant with realistic
 * TeachSpark / RailCite fixture data for screenshot review at 390 & 1440 (§C Phase-4 "one artifact
 * board reviewed"). Not linked from nav, excluded from the sitemap, and 404s in a production build
 * unless `ALLOW_DEV_ROUTES` is set (see lib/dev-only.ts). Real artifact data lands in M-005.
 */
export default function ArtifactsDevPage() {
  devOnly();

  return (
    <main className="min-h-screen bg-bg px-[var(--gutter-mobile)] py-[var(--space-9)] text-ink md:px-[var(--gutter-tablet)]">
      <header className="mb-[var(--space-8)]">
        <p className="text-caption uppercase tracking-[var(--tracking-eyebrow)] text-ink-3">
          Dev board · QA only
        </p>
        <h1 className="text-h2">Case-study artifacts</h1>
        <p className="mt-[var(--space-3)] max-w-[60ch] text-[length:var(--text-body)] text-ink-2">
          Every artifact variant the schema defines, rendered through <code>ArtifactRenderer</code>{" "}
          with fixture data. Each carries a source label (never a filesystem path) and every metric
          is dated and sourced.
        </p>
      </header>

      {/* The chapter-column grid: 1-up / 2-up ≥768 / 3-up ≥1024 (AC 3). */}
      <section aria-labelledby="board-all" className="mt-[var(--space-6)]">
        <h2 id="board-all" className="text-h3 mb-[var(--space-5)]">
          All variants · grid
        </h2>
        <ArtifactGrid>
          {ARTIFACTS.map((artifact) => (
            <ArtifactRenderer key={artifact.id} artifact={artifact} sources={SOURCES} />
          ))}
        </ArtifactGrid>
      </section>
    </main>
  );
}
