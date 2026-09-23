"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { BookMarked, Laptop, Sprout, type LucideIcon } from "lucide-react";
import { ClayFrame } from "@/components/clay/ClayFrame";
import { ClayIcon } from "@/components/clay/ClayIcon";
import type { Tone } from "@/components/clay/tiers";
import { useReducedMotionSafe, usePointerFine } from "@/lib/motion";
import { site } from "@/lib/site";
import { HERO_MOTION } from "@/lib/heroMotion";
import { usePointerParallax, useParallaxLayer, type PointerParallax } from "@/hooks/usePointerParallax";
import { useHeroActivation } from "./HeroActivationContext";

// The avatar is the LCP element: intrinsic 1440×1800 (4:5), rendered at the frame's CSS width.
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

// A-bis pose/expression variants — normalized webps (scripts/avatar-poses.ts) crossfaded over the
// LCP base avatar. Gaze variants map 1:1 to the hovered concept; ask-lean is the Ask-focus pose; the
// idle cycle draws from the expression pool. Each key has an /avatar/avatar-<key>.webp asset.
const GAZE_BY_CONCEPT: Record<Concept, VariantKey> = {
  build: "gaze-laptop", // laptop tile (top-left)
  learn: "gaze-book", // book tile (right)
  grow: "gaze-plant", // plant tile (bottom-left)
};
const IDLE_EXPRESSIONS = ["smile", "thinking", "surprised"] as const;
// Every variant that gets a preloaded crossfade layer (gazes + ask-lean + the idle expressions).
const VARIANT_KEYS = [
  "gaze-laptop",
  "gaze-book",
  "gaze-plant",
  "ask-lean",
  "smile",
  "thinking",
  "surprised",
] as const;
type VariantKey = (typeof VARIANT_KEYS)[number];

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

  // Pose/expression swaps run only on a fine pointer with motion allowed. `activated` defers loading
  // the variant webps until the visitor first engages the scene, keeping them off the LCP / initial
  // path; `idleExpr` is the current at-rest expression chosen by the idle cycle below.
  const pointerFine = usePointerFine();
  const swapsEnabled = pointerFine && !reduced;
  const [activated, setActivated] = useState(false);
  const [idleExpr, setIdleExpr] = useState<VariantKey | null>(null);

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

  // Which variant (if any) is showing right now. Priority: a hovered tile's gaze (most direct
  // intent) › the Ask-focus lean › the idle at-rest expression › none (the base avatar).
  const activeVariant: VariantKey | null = !swapsEnabled
    ? null
    : hovered
      ? GAZE_BY_CONCEPT[hovered]
      : askActive
        ? "ask-lean"
        : idleExpr;

  // Idle expression cycle: when engaged and otherwise at rest, occasionally hold a subtle expression
  // then return to the base ("alive, not animated"). A bounded recursive-timeout loop (its stop rule
  // is unmount / deps change); paused while the tab is hidden. Idle picks are ignored by the priority
  // above whenever a tile is hovered or Ask is focused, so no need to coordinate with those here.
  useEffect(() => {
    if (!activated || !swapsEnabled) return;
    const { idleHoldMs, idleGapMinMs, idleGapMaxMs } = HERO_MOTION.expression;
    let gapTimer: ReturnType<typeof setTimeout>;
    let holdTimer: ReturnType<typeof setTimeout>;
    const scheduleNext = () => {
      const gap = idleGapMinMs + Math.random() * (idleGapMaxMs - idleGapMinMs);
      gapTimer = setTimeout(() => {
        if (typeof document !== "undefined" && document.hidden) {
          scheduleNext(); // tab backgrounded — don't emote, just try again later
          return;
        }
        const expr = IDLE_EXPRESSIONS[Math.floor(Math.random() * IDLE_EXPRESSIONS.length)]!;
        setIdleExpr(expr);
        holdTimer = setTimeout(() => {
          setIdleExpr(null);
          scheduleNext();
        }, idleHoldMs);
      }, gap);
    };
    scheduleNext();
    return () => {
      clearTimeout(gapTimer);
      clearTimeout(holdTimer);
      setIdleExpr(null);
    };
  }, [activated, swapsEnabled]);

  return (
    <div
      ref={containerRef}
      data-scene-active={sceneActive ? "true" : undefined}
      // Defer mounting/loading the variant layers until the visitor first engages the scene.
      onPointerEnter={swapsEnabled ? () => setActivated(true) : undefined}
      style={{ "--hero-xfade": `${HERO_MOTION.expression.crossfadeMs}ms` } as CSSProperties}
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
                width={1440}
                height={1800}
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
                A-bis variant layers — normalized pose/expression webps (scripts/avatar-poses.ts)
                crossfaded over the base: gaze toward a hovered tile, the Ask-focus lean, and the
                idle expression. Mounted only after first engagement on a fine pointer with motion
                allowed (deferred off the LCP path); each is decorative (aria-hidden), opacity-only,
                and toggled via `data-active` (see `.hero-avatar-variant` in globals.css).

                STILL DEFERRED (need a separated foreground/background avatar, not a full-frame swap):
                per-object effects like laptop-screen glow, plant-leaf tilt, books emphasise, and true
                eyelid blink — independent gens won't align tightly enough for a clean partial swap.
              */}
              {activated &&
                swapsEnabled &&
                VARIANT_KEYS.map((key) => (
                  <Image
                    key={key}
                    src={`/avatar/avatar-${key}.webp`}
                    alt=""
                    aria-hidden
                    width={1440}
                    height={1800}
                    sizes={AVATAR_SIZES}
                    loading="lazy"
                    data-active={activeVariant === key ? "true" : undefined}
                    className="hero-avatar-variant absolute inset-0 h-full w-full object-cover"
                  />
                ))}
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
