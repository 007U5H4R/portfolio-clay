import { devOnly } from "@/lib/dev-only";
import { ArtifactRenderer } from "@/components/case-study/artifacts/ArtifactRenderer";
import { ArtifactGrid } from "@/components/case-study/artifacts/ArtifactGrid";
import { ARTIFACTS, SOURCES } from "./fixtures";

/**
 * /dev/artifacts (TKT-20; restyled TKT-83) — the QA-only board that renders every `Artifact` variant
 * in its §7.3 paper form (`ArtifactGrid` cluster, exactly as a chapter lays them out) with realistic
 * TeachSpark / RailCite fixture data for screenshot review at 390 & 1440 and the EVAL-018 collector
 * (TC-160: 0 violations — every Caveat string is a `Hand` exemption inside a `data-paper` object; the
 * board itself carries 0 decorations). Not linked from nav, excluded from the sitemap, and 404s in a
 * production build unless `ALLOW_DEV_ROUTES` is set (see lib/dev-only.ts).
 */
export default function ArtifactsDevPage() {
  devOnly();

  return (
    <main className="min-h-screen bg-paper px-[var(--gutter-mobile)] py-[var(--space-9)] text-navy md:px-[var(--gutter-tablet)]">
      <header className="mb-[var(--space-8)]">
        <p className="text-caption font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-navy-2">
          Dev board · QA only
        </p>
        <h1 className="text-h2">Case-study artifacts</h1>
        <p className="mt-[var(--space-3)] max-w-[60ch] text-[length:var(--text-body)] text-navy-2">
          Every artifact variant the schema defines, rendered through <code>ArtifactRenderer</code>{" "}
          in its paper form (Design.md §7.3) with fixture data. Each carries a source label (never a
          filesystem path) and every metric is dated and sourced.
        </p>
      </header>

      {/* The chapter cluster: paper objects alternating ±0.6°, full width ≤ 640 (TKT-83). */}
      <section id="board-artifacts" aria-labelledby="board-all" className="chapter mt-[var(--space-6)]">
        <h2 id="board-all" className="text-h3 mb-[var(--space-5)]">
          All variants · cluster
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
