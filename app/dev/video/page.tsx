import { devOnly } from "@/lib/dev-only";
import { VideoDevBoard } from "./VideoDevBoard";

/**
 * /dev/video (TKT-18) — QA-only fixture board for the four DemoVideo states (EVAL-014). Server
 * component so the `devOnly()` guard can read `ALLOW_DEV_ROUTES` (a non-`NEXT_PUBLIC_` var,
 * invisible to the client bundle): 404s in a normal production build, renders under
 * `ALLOW_DEV_ROUTES=1` (`pnpm dev`, or a QA `ALLOW_DEV_ROUTES=1 pnpm build && start`). The page
 * reads no `searchParams`, so it stays fully static (TP1's all-routes-prerendered guarantee) even
 * in the QA build. Excluded from the sitemap.
 */
export default function VideoDevPage() {
  devOnly();
  return <VideoDevBoard />;
}
