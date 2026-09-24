"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentPropsWithoutRef,
  type CSSProperties,
} from "react";

type RevealOwnProps = {
  /** Stagger position among sibling Reveals — multiplies the 70ms stagger step (A6 / Design.md §4). */
  index?: number | undefined;
  threshold?: number | undefined;
};

export type RevealProps = RevealOwnProps & Omit<ComponentPropsWithoutRef<"div">, keyof RevealOwnProps>;

const DEFAULT_THRESHOLD = 0.2;

// "Has this component committed on the client yet" as a useSyncExternalStore read (never a
// setState-in-effect, which react-hooks/set-state-in-effect flags) — same SSR-safe, "unknown
// until mounted" pattern as lib/motion.ts's useReducedMotionSafe: server/first-paint snapshot is
// false, the live snapshot is true, and there is nothing to subscribe to since it never changes
// again after the first commit.
const noopSubscribe = () => () => {};
const getMountedSnapshot = () => true;
const getMountedServerSnapshot = () => false;
function useMounted(): boolean {
  return useSyncExternalStore(noopSubscribe, getMountedSnapshot, getMountedServerSnapshot);
}

/**
 * Section-reveal leaf (technical-plan.md §B S05.02, Design.md §8 "Section reveal" row). Fires
 * once via `IntersectionObserver` at `threshold` (default 0.2), then disconnects — `data-revealed`
 * marks the fired state. The motion is opacity 0 → 1 + `translateY(12px)` → none, never a scale
 * (TSK-33 restyle; `.reveal` in app/globals.css).
 *
 * The `.reveal` class (and therefore the pre-reveal hidden state) is applied only **after mount**,
 * never in the server-rendered markup. So with JavaScript disabled the class is never added and
 * children render at their natural, fully visible styles (EVAL-015) — no `<noscript>` needed.
 *
 * Reduced motion is handled entirely in CSS (`app/globals.css` — the global 1ms transition-duration
 * rule plus a `.reveal`-specific `transition-property: opacity` override, A6), not here: this
 * component only ever toggles `data-revealed`.
 */
export function Reveal(props: RevealProps) {
  const { index = 0, threshold = DEFAULT_THRESHOLD, className, style, children, ...rest } = props;
  const ref = useRef<HTMLDivElement>(null);
  const mounted = useMounted();
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!mounted || !el) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [mounted, threshold]);

  const classes = [mounted ? "reveal" : "", className].filter(Boolean).join(" ");
  const mergedStyle = { ...style, "--stagger-index": index } as CSSProperties;

  return (
    <div ref={ref} data-revealed={revealed ? "" : undefined} className={classes} style={mergedStyle} {...rest}>
      {children}
    </div>
  );
}
