import { Star } from "lucide-react";

/**
 * TASK-252 (Tushar 2026-10-18): a quiet, handwritten nudge to star the repo, shown only where a GitHub link shows
 * (the caller renders it only when `product.githubUrl` exists). The note IS the link — same href, new tab — with its
 * own accessible name; no button styling. The star fills on hover/focus (reduced motion: no transition, see globals.css).
 */
export function StarNote({ name, href }: { name: string; href: string }) {
  return (
    <a className="pf-star-note font-hand focus-ring" href={href} target="_blank" rel="noopener noreferrer" aria-label={`Star ${name} on GitHub (opens in a new tab)`}>
      <Star className="pf-star-icon" aria-hidden="true" focusable="false" strokeWidth={1.75} />
      <span>Sparked something? A star on the repo keeps the next build coming</span>
    </a>
  );
}
