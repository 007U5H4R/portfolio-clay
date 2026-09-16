import { readFileSync } from "node:fs";
import { join } from "node:path";
import Image from "next/image";
import { BookMarked, Laptop, Sprout } from "lucide-react";
import { ClayFrame } from "@/components/clay/ClayFrame";
import { ClayIcon } from "@/components/clay/ClayIcon";
import { Parallax } from "@/components/interactions/Parallax";
import { site } from "@/lib/site";

// Read once at build time (SSG server component). Keeps the blurDataURL's single source of truth
// in public/avatar/avatar-blur.txt (produced by scripts/avatar.ts, TSK-02) — never hard-coded here.
const blurDataURL = readFileSync(join(process.cwd(), "public/avatar/avatar-blur.txt"), "utf8").trim();

// The avatar is the LCP element: intrinsic 1800×2250 (4:5), rendered at the frame's CSS width.
const AVATAR_SIZES =
  "(min-width:1440px) 520px, (min-width:1024px) 480px, (min-width:768px) 360px, 280px";

/**
 * Hero avatar bezel (technical-plan.md §B S05.02, Design.md §3). A sky→lavender duotone hero
 * `ClayFrame` (4:5) holding the priority `next/image` avatar, with up to 3 supporting `ClayIcon`
 * tiles pinned at the frame corners. Each layer is independently cursor-parallaxed (`Parallax`);
 * the avatar moves opposite the cursor (`depth={-1}`), the tiles with it at shallower depths.
 * On touch / reduced-motion every layer is static.
 */
export function AvatarStage() {
  return (
    <div className="relative mx-auto w-full max-w-[280px] md:max-w-[360px] lg:max-w-[480px] 2xl:max-w-[520px]">
      <Parallax depth={-1} maxPx={6}>
        <ClayFrame ratio="4/5" tier="hero" tone="sky" tone2="lavender">
          <Image
            src="/avatar/avatar.webp"
            alt={site.avatarAlt}
            width={1800}
            height={2250}
            priority
            // Next 16.3.5's next/image does NOT derive `fetchpriority` from `priority` (it only
            // emits the LCP preload link), so set it explicitly — the avatar is the LCP element.
            fetchPriority="high"
            placeholder="blur"
            blurDataURL={blurDataURL}
            sizes={AVATAR_SIZES}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </ClayFrame>
      </Parallax>

      {/* Supporting tiles at the frame corners — depths 0.5 / 1 / 1.5 (maxPx = 6×depth). */}
      <Parallax depth={0.5} maxPx={3} className="absolute -left-5 top-8 z-10">
        <ClayIcon icon={Laptop} size={56} tone="mint" />
      </Parallax>
      <Parallax depth={1} maxPx={6} className="absolute -right-5 top-1/3 z-10">
        <ClayIcon icon={BookMarked} size={56} tone="butter" />
      </Parallax>
      <Parallax depth={1.5} maxPx={9} className="absolute -left-4 bottom-8 z-10">
        <ClayIcon icon={Sprout} size={56} tone="blush" />
      </Parallax>
    </div>
  );
}
