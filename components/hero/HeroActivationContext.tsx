"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

/**
 * Cross-section link between the "Ask my portfolio" input and the hero avatar scene (animation
 * prompt.md §5). The Ask input and the Hero live in DIFFERENT sections of app/page.tsx, so this
 * tiny context lifts a single boolean — "is the Ask input focused?" — to a common ancestor
 * (`HeroActivationProvider`, wrapped around the page). Focusing the input flips it true; the hero's
 * `AvatarScene` reads it and subtly "wakes up" (icons drift inward, avatar leans, scene glow rises).
 *
 * Deliberately just a boolean + setter — no state machine (spec: "Do not over-engineer"). The
 * default value is a no-op so `AskPortfolio` (also mounted in the /dev/ask harness, with no hero on
 * the page) can call `setActive` safely without a provider.
 */
export interface HeroActivation {
  /** True while the Ask input is focused — the signal that the workspace should feel "activated". */
  active: boolean;
  setActive: (value: boolean) => void;
}

const HeroActivationContext = createContext<HeroActivation>({
  active: false,
  setActive: () => {},
});

export function HeroActivationProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(false);
  const value = useMemo<HeroActivation>(() => ({ active, setActive }), [active]);
  return <HeroActivationContext.Provider value={value}>{children}</HeroActivationContext.Provider>;
}

export function useHeroActivation(): HeroActivation {
  return useContext(HeroActivationContext);
}
