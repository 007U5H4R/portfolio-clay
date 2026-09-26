/**
 * Paw (TKT-104 r2 → TKT-113) — a small paw print for "Ask Tushky 🐾", drawn so it takes a paper token
 * (currentColor), not emoji colour. Its own module so the Home launcher can use it without importing
 * the lazy drawer's `AskTushky` module (EVAL-005). Always decorative.
 */
export function Paw({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={className} fill="currentColor">
      <ellipse cx="6" cy="10" rx="2.3" ry="3" />
      <ellipse cx="10.2" cy="5.6" rx="2.3" ry="3" />
      <ellipse cx="15.4" cy="5.8" rx="2.3" ry="3" />
      <ellipse cx="19.2" cy="10.4" rx="2.2" ry="2.9" />
      <path d="M12.6 11.2c3.2 0 6.2 4.6 6.2 7 0 2-1.6 2.8-3.2 2.8-1.3 0-2-.8-3-.8s-1.8.8-3.2.8c-1.6 0-3-.9-3-2.8 0-2.5 3-7 6.2-7Z" />
    </svg>
  );
}
