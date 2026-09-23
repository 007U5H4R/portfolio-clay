"use client";

import Image from "next/image";
import { useCallback, useRef, useState, type CSSProperties } from "react";
import { BookMarked, Laptop, Sprout, type LucideIcon } from "lucide-react";
import { ClayFrame } from "@/components/clay/ClayFrame";
import { ClayIcon } from "@/components/clay/ClayIcon";
import type { Tone } from "@/components/clay/tiers";
import { useReducedMotionSafe } from "@/lib/motion";
import { site } from "@/lib/site";
import { HERO_MOTION } from "@/lib/heroMotion";
import { usePointerParallax, useParallaxLayer, type PointerParallax } from "@/hooks/usePointerParallax";
import { useHeroActivation } from "./HeroActivationContext";

// The avatar is the LCP element: intrinsic 1800×2250 (4:5), rendered at the frame's CSS width.
const AVATAR_SIZES =
  "(min-width:1440px) 520px, (min-width:1024px) 480px, (min-width:768px) 300px, 200px";

type Concept = "build" | "learn" | "grow";

interface TileDef {
  icon: LucideIcon;
  tone: Tone;
  /** Build / Learn / Grow — drives which way the avatar leans toward it on hover. */
  concept: Concept;
  /** Corner placement (unchanged from the original AvatarStage layout). */
  pos: string;
  /** Inward drift vector applied when the Ask input is focused (px, toward the scene centre). */
  drift: { x: number; y: number };
}

// Laptop=Build (top-left), Book=Learn (right), Sprout=Grow (bottom-left). Positions/tones/icons are
// preserved verbatim from the pre-animation AvatarStage so this is a pure motion enhancement.
const TILES: readonly TileDef[] = [
  { icon: Laptop, tone: "mint", concept: "build", pos: "-left-5 top-8", drift: { x: 4, y: 2 } },
  { icon: BookMarked, tone: "butter", concept: "learn", pos: "-right-5 top-1/3", drift: { x: -4, y: 0 } },
  { icon: Sprout, tone: "blush", concept: "grow", pos: "-left-4 bottom-8", drift: { x: 4, y: -2 } },
];

// How far the avatar leans toward each hovered object (px on X; spec §4 "avatar shifts toward …").
const CONCEPT_LEAN: Record<Concept, number> = {
  build: -HERO_MOTION.activation.leanX, // laptop sits left → lean left
  learn: HERO_MOTION.activation.leanX, // book sits right → lean right
  grow: -HERO_MOTION.activation.leanX, // plant sits left → lean left
};

export interface AvatarSceneProps {
  /** blurDataURL read from disk in the server AvatarStage wrapper (keeps readFileSync server-side). */
  blurDataURL: string;
}

/**
 * AvatarScene — the interactive hero avatar (animation prompt.md; Design.md §3, "WoW" pass). Design
 * principle: **a human presence that reacts, not performs.** Layers, from back to front:
 *   1. scene glow  — soft accent halo that rises on hover / Ask-focus ("the workspace waking up").
 *   2. frame+avatar — the composite clay bezel + LCP photo: cursor parallax + ±2° card tilt (JS
 *      springs), a gentle CSS idle-breathing loop, and a CSS lean toward a hovered object / the desk.
 *   3. icon tiles  — Build / Learn / Grow: deeper cursor parallax, staggered CSS entrance, CSS hover
 *      lift + glow, and an inward drift when the Ask input is focused.
 *
 * LCP / no-JS safety (matches the site's `.reveal` contract): the entrance is PURE CSS keyframes
 * that play on load with no JS class toggle, so server-rendered HTML paints fully in place and works
 * with JS disabled. The avatar's own entrance is transform-only (opacity stays 1) so the LCP image
 * is never faded in. Parallax/tilt/lean/drift are transform/opacity only.
 *
 * Reduced motion & touch: `usePointerParallax` disables parallax/tilt off a fine pointer or under
 * `prefers-reduced-motion`; the CSS breathing/tilt are scoped to `(hover:hover) and (pointer:fine)
 * and (prefers-reduced-motion:no-preference)`; lean/drift movement is gated on `!reduced`. Hover and
 * Ask-focus GLOW (colour only) stay on everywhere — hover/focus remain functional, just simplified.
 *
 * DEFERRED per-object effects (need a separated / multi-frame avatar asset, not the current single
 * flat webp — see the extension seam below): laptop-screen glow, plant-leaf tilt, books emphasise,
 * eyes/gaze toward an icon, blink, and the 4 expressions. Not faked.
 */
export function AvatarScene({ blurDataURL }: AvatarSceneProps) {
  const reduced = useReducedMotionSafe();
  const { active: askActive } = useHeroActivation();
  const parallax = usePointerParallax();
  const { containerRef, nx, ny, active } = parallax;

  // Which tile is hovered (drives the avatar's lean direction). Pointer-only by nature.
  const [hovered, setHovered] = useState<Concept | null>(null);

  const p = HERO_MOTION.parallax;

  // Frame+avatar: parallax translate + ±tilt (perspective) composited into one transform string on
  // one element (the leaf below owns lean, the leaf below that owns entrance+breathing).
  const cardWriter = useCallback(
    (x: number, y: number) =>
      `translate3d(${(x * p.avatar).toFixed(2)}px, ${(y * p.avatar).toFixed(2)}px, 0) ` +
      `perspective(1200px) rotateX(${(-y * p.tilt).toFixed(2)}deg) rotateY(${(x * p.tilt).toFixed(2)}deg)`,
    [p.avatar, p.tilt],
  );
  const cardRef = useRef<HTMLDivElement>(null);
  useParallaxLayer(cardRef, nx, ny, active, cardWriter);

  // Avatar lean (CSS transition on a separate element): toward a hovered object, else toward the
  // desk while the Ask input is focused, else rest. Movement only when motion is allowed.
  const leanX = reduced ? 0 : hovered ? CONCEPT_LEAN[hovered] : askActive ? HERO_MOTION.activation.leanX : 0;
  const leanRotate = leanX === 0 ? 0 : Math.sign(leanX) * HERO_MOTION.activation.leanRotate;
  const leanStyle = {
    "--lean-x": `${leanX}px`,
    "--lean-rot": `${leanRotate}deg`,
  } as CSSProperties;

  // Scene glow rises when a tile is hovered or the Ask input is focused.
  const sceneActive = askActive || hovered !== null;

  return (
    <div
      ref={containerRef}
      data-scene-active={sceneActive ? "true" : undefined}
      className="relative mx-auto w-full max-w-[200px] md:max-w-[300px] lg:max-w-[480px] 2xl:max-w-[520px]"
    >
      {/* 1 — activation glow (decorative; colour-only ramp, safe under reduced motion) */}
      <span aria-hidden="true" className="hero-scene-glow" />

      {/* 2 — frame + avatar composite: parallax+tilt (JS) › lean (CSS) › entrance+breathe (CSS) */}
      <div ref={cardRef} className="hero-card">
        <div className="hero-avatar-lean" style={leanStyle}>
          <div className="hero-avatar-motion">
            <ClayFrame ratio="4/5" tier="hero" tone="sky" tone2="lavender">
              <Image
                src="/avatar/avatar.webp"
                alt={site.avatarAlt}
                width={1800}
                height={2250}
                priority
                // Next 16's next/image does NOT derive `fetchpriority` from `priority`; the avatar is
                // the LCP element, so set it explicitly.
                fetchPriority="high"
                placeholder="blur"
                blurDataURL={blurDataURL}
                sizes={AVATAR_SIZES}
                className="absolute inset-0 h-full w-full object-cover"
              />
              {/*
                EXTENSION SEAM — per-object effects (laptop-screen glow, plant-leaf tilt, books
                emphasise, gaze/blink/expressions). The current avatar is ONE flat webp, so these
                cannot be done without separated foreground/background or multi-frame avatar assets.
                When those land, mount the per-object overlay layers here (e.g. an absolutely-
                positioned `laptopGlow` element keyed off `hovered === "build"`) — the hover/focus
                state that would drive them (`hovered`, `askActive`) is already wired above.
              */}
            </ClayFrame>
          </div>
        </div>
      </div>

      {/* 3 — supporting icon tiles (Build / Learn / Grow) */}
      {TILES.map((tile, i) => (
        <IconTile
          key={tile.concept}
          def={tile}
          index={i}
          parallax={parallax}
          reduced={reduced}
          askActive={askActive}
          onHoverChange={setHovered}
        />
      ))}
    </div>
  );
}

interface IconTileProps {
  def: TileDef;
  index: number;
  parallax: PointerParallax;
  reduced: boolean;
  askActive: boolean;
  onHoverChange: (concept: Concept | null) => void;
}

/**
 * One floating icon tile. Three composed transform layers: the outer ref carries cursor parallax +
 * a hair of rotate (JS springs); `.hero-tile-enter` runs the staggered CSS entrance; `.hero-tile`
 * owns the CSS hover lift + glow and the inward Ask-focus drift (both via CSS custom properties).
 */
function IconTile({ def, index, parallax, reduced, askActive, onHoverChange }: IconTileProps) {
  const { nx, ny, active } = parallax;
  const p = HERO_MOTION.parallax;

  const tileWriter = useCallback(
    (x: number, y: number) =>
      `translate3d(${(x * p.tile).toFixed(2)}px, ${(y * p.tile).toFixed(2)}px, 0) ` +
      `rotate(${(x * p.iconTilt).toFixed(2)}deg)`,
    [p.tile, p.iconTilt],
  );
  const ref = useRef<HTMLDivElement>(null);
  useParallaxLayer(ref, nx, ny, active, tileWriter);

  // Inward drift only when the Ask input is focused and motion is allowed.
  const drift = askActive && !reduced ? def.drift : { x: 0, y: 0 };
  const enterDelay = HERO_MOTION.entrance.tileBaseDelayMs + index * HERO_MOTION.entrance.staggerMs;

  const tileStyle = {
    "--drift-x": `${drift.x}px`,
    "--drift-y": `${drift.y}px`,
  } as CSSProperties;

  return (
    <div ref={ref} className={`absolute z-10 ${def.pos}`}>
      <div className="hero-tile-enter" style={{ animationDelay: `${enterDelay}ms` }}>
        <div
          className="hero-tile"
          style={tileStyle}
          onPointerEnter={() => onHoverChange(def.concept)}
          onPointerLeave={() => onHoverChange(null)}
        >
          <ClayIcon icon={def.icon} size={56} tone={def.tone} />
        </div>
      </div>
    </div>
  );
}
