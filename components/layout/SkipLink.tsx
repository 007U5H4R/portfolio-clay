/**
 * Visually hidden until focused; the first tab stop on every page (technical-plan.md §B
 * S04.02, Design.md §3). Targets `#main`, set on the `<main>` element in `app/layout.tsx`.
 */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only fixed left-4 top-4 z-50 rounded-[var(--radius-clay-sm)] bg-bg px-4 py-2 text-[14px] font-semibold text-ink shadow-[var(--shadow-clay-rest)] focus-ring"
    >
      Skip to main content
    </a>
  );
}
