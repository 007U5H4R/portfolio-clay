/**
 * Spec §24: a compact, light sticky navigator ("Problem · Product · Decisions · System · Evidence").
 * Rendered only where it helps (≥ 1024 px, CSS); below that it is removed from layout and the page
 * is a plain stacked read. Plain in-page anchors — no JS, no scroll-spy.
 */
export function CaseStudyNav({ items, name }: { items: readonly { id: string; label: string }[]; name: string }) {
  if (items.length < 3) return null;
  return (
    <nav className="csx-nav" aria-label={`${name} case study sections`}>
      <ol>
        {items.map((item, index) => (
          <li key={item.id}>
            <a href={`#${item.id}`} className="csx-nav-link focus-ring">
              <span className="csx-nav-n" aria-hidden="true" data-micro-label="">
                {String(index + 1).padStart(2, "0")}
              </span>
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
