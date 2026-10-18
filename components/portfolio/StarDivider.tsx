/** TASK-256 (Tushar 2026-10-18): a thin muted line with a small four-point star at its midpoint (decorative; styled by `.pf-divider`). */
export function StarDivider({ slot }: { slot: "top" | "foot" }) {
  return (
    <span className="pf-divider" data-slot={slot} aria-hidden="true">
      <svg viewBox="0 0 24 24" focusable="false">
        <path d="M12 1c.9 6.3 4.7 10.1 11 11-6.3.9-10.1 4.7-11 11-.9-6.3-4.7-10.1-11-11C7.3 11.1 11.1 7.3 12 1Z" />
      </svg>
    </span>
  );
}
