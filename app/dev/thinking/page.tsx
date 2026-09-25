import { devOnly } from "@/lib/dev-only";
import { ShowTheThinking } from "@/components/interactions/ShowTheThinking";
import { SOURCES, THINKING_CHAIN } from "./fixtures";

/**
 * /dev/thinking (TKT-21; restyled TKT-83) — the QA-only board that renders `ShowTheThinking` on
 * paper (nested `section.thinking`: button, annotation, chain sketch, medallions, label tags) with
 * an illustrative, sourced TeachSpark chain (fixtures.ts) for screenshot review at 390 & 1440 and as
 * the target of `tests/e2e/thinking.spec.ts`. Not linked from nav, excluded from the sitemap, and
 * 404s in a production build unless `ALLOW_DEV_ROUTES` is set (lib/dev-only.ts).
 */
export default function ThinkingDevPage() {
  devOnly();

  return (
    <main className="min-h-screen bg-paper px-[var(--gutter-mobile)] py-[var(--space-9)] text-navy md:px-[var(--gutter-tablet)]">
      <header className="mb-[var(--space-8)]">
        <p className="text-caption font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-navy-2">
          Dev board · QA only
        </p>
        <h1 className="text-h2">Show the thinking</h1>
        <p className="mt-[var(--space-3)] max-w-[60ch] text-[length:var(--text-body)] text-navy-2">
          The 8-node reasoning-chain reveal, below the last chapter in a real case study, on paper:
          two counted decorations (the annotation and the chain sketch), medallions and label tags as
          content. The chain below is an illustrative TeachSpark fixture — 5 of 8 nodes reuse verbatim,
          already-sourced copy; the other 3 say plainly that their note is not yet recorded.
        </p>
      </header>

      <section aria-labelledby="board-thinking" className="max-w-[calc(68ch+260px)]">
        <h2 id="board-thinking" className="text-h3 mb-[var(--space-5)]">
          TeachSpark · illustrative chain
        </h2>
        <ShowTheThinking chain={THINKING_CHAIN} sources={SOURCES} />
      </section>

      {/* AC 1: a thin project's empty chain hides the whole interaction — no empty toggle. */}
      <section aria-labelledby="board-thin" className="mt-[var(--space-9)] max-w-[640px]">
        <h2 id="board-thin" className="text-h3 mb-[var(--space-5)]">
          Thin project · empty chain (renders nothing below)
        </h2>
        <div data-testid="thin-chain-mount">
          <ShowTheThinking chain={[]} sources={SOURCES} />
        </div>
      </section>
    </main>
  );
}
