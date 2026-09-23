import { readFileSync } from "node:fs";
import { join } from "node:path";
import { AvatarScene } from "@/components/hero/AvatarScene";

// Read once at build time (SSG server component). Keeps the blurDataURL's single source of truth
// in public/avatar/avatar-blur.txt (produced by scripts/avatar.ts, TSK-02) — never hard-coded here.
// This is why AvatarStage stays a server component: readFileSync cannot run in the client
// `AvatarScene`, so the blur is read here and handed down as a prop.
const blurDataURL = readFileSync(join(process.cwd(), "public/avatar/avatar-blur.txt"), "utf8").trim();

/**
 * Hero avatar bezel (technical-plan.md §B S05.02, Design.md §3, "WoW" motion pass). Thin server
 * wrapper: reads the LCP image's blur placeholder at build time and delegates the whole interactive
 * scene to the client `AvatarScene` (entrance, cursor parallax + tilt, idle breathing, icon-tile
 * hover, and the Ask-focus "activation"). See AvatarScene for the full motion contract and the
 * reduced-motion / touch fallbacks.
 */
export function AvatarStage() {
  return <AvatarScene blurDataURL={blurDataURL} />;
}
