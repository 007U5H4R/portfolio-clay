import { devOnly } from "@/lib/dev-only";
import { AskDevBoard } from "./AskDevBoard";

/**
 * /dev/ask (S10.05) — QA-only fixture board for the five Ask states. Server component so the
 * `devOnly()` guard can read `ALLOW_DEV_ROUTES` (a non-`NEXT_PUBLIC_` var, invisible to the client
 * bundle): 404s in a normal production build, renders under `ALLOW_DEV_ROUTES=1` (`pnpm dev`, or a
 * QA `ALLOW_DEV_ROUTES=1 pnpm build && start`). The page reads NO `searchParams`, so it stays fully
 * static and satisfies the TP1 all-routes-prerendered guarantee (`scripts/assert-static.ts`) even in
 * the QA build; the `?mode=…` selector is read client-side by `AskDevBoard`. Excluded from the sitemap.
 */
export default function AskDevPage() {
  devOnly();
  return <AskDevBoard />;
}
