import { notFound } from "next/navigation";

/**
 * Guard for every `/dev/*` route (S03.06). Call at the top of the page component: in a
 * production build with `ALLOW_DEV_ROUTES` unset, the route 404s; in `pnpm dev` (or a build with
 * `ALLOW_DEV_ROUTES` set) it renders normally. `/dev/*` routes must also stay out of the
 * sitemap once one exists.
 */
export function devOnly(): void {
  if (process.env.NODE_ENV === "production" && !process.env.ALLOW_DEV_ROUTES) {
    notFound();
  }
}
