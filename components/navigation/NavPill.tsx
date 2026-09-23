/**
 * Lavender utility-fill pill absolutely positioned behind the active nav link (Design.md §3,
 * technical-plan.md §B S04.04). `Header` renders exactly one instance at a time, inside whichever
 * link matches the current route.
 *
 * TKT-49 perf lever: this was an `m.span` with `layoutId`/`layout="position"` under
 * `LazyMotion features={domAnimation}`. But `domAnimation` (features-animation) ships only the
 * animation + gesture features — NOT the layout feature (that lives in `domMax`). So the
 * `layoutId` cross-link slide never actually ran: the pill only ever re-rendered at the active
 * link's position, with no animation. Rendering a plain `<span>` is therefore byte-for-byte the
 * same visible result, while removing this component as a consumer of the ~28 kB gz `domAnimation`
 * feature bundle from the shared header (and thus from `/` first-load JS, EVAL-005). If a real
 * sliding pill is wanted later, it needs `domMax` (a deliberate bundle cost) or a CSS/FLIP
 * approach — reintroduce it as its own decision then.
 *
 * `aria-current="page"` lives on the `<Link>` itself (`Header.tsx`), never here — this element is
 * purely decorative background, so it stays `aria-hidden`.
 */
export function NavPill() {
  return (
    <span
      aria-hidden="true"
      className="absolute inset-0 rounded-[var(--radius-pill)] bg-lavender/30"
    />
  );
}
