"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { experience } from "@/data/experience";
import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { useReducedMotionSafe } from "@/lib/motion";
import { StoryCard } from "./StoryCard";
import { TimelineNode } from "./TimelineNode";
import { nextNodeIndex, roleIdFromHash, SECTION_ANCHOR, storyCardId, toggleOpen } from "./timeline-logic";

const IDS = experience.map((role) => role.id);

/**
 * Location-hash as a React 18 external store (the same SSR-safe idiom as `lib/motion`'s
 * `useReducedMotionSafe` / `ShowTheThinking`'s `useMounted`): the server snapshot and the first
 * client render both read `null` (matching the all-closed prerendered HTML), then after commit the
 * live hash resolves to its role id and the deep-linked card opens — with NO `setState` inside an
 * effect (`react-hooks/set-state-in-effect`) and no hydration mismatch.
 */
function subscribeHash(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("hashchange", onChange);
  window.addEventListener("popstate", onChange);
  return () => {
    window.removeEventListener("hashchange", onChange);
    window.removeEventListener("popstate", onChange);
  };
}
const getHashSnapshot = () => (typeof window === "undefined" ? null : roleIdFromHash(window.location.hash, IDS));
const getHashServerSnapshot = () => null;

/**
 * ExperienceTimeline (TKT-41, Design.md §3) — the interactive corporate experience timeline on
 * `/about`: one connecting line, four `TimelineNode`s, each expanding to a `StoryCard`. It owns the
 * three novel behaviours EVAL-007/EVAL-010 name for this component:
 *
 *   • One open at a time (AC 3): a single open-role value — opening a node closes any other.
 *   • Full keyboard path (AC 2, EVAL-007): each node is a real `<button>` (Enter/Space open it);
 *     Arrow keys rove focus between nodes (delegated on the rail via `data-node-index`, both axes);
 *     `Esc` closes the open card and returns focus to its node. `aria-expanded`/`aria-controls` are
 *     wired on every node.
 *   • Deep link (AC 2): `#experience-<id>` opens that role on load and scrolls/focuses it; toggling
 *     syncs the hash via `history.replaceState` (no scroll jump, no history spam); the bare
 *     `#experience` section anchor keeps working for the `/work` ExperienceStrip + Ask evidence.
 *
 * Open state is `userOpenId` (`undefined` = the user has not acted yet, so follow the hash; `null`
 * = explicitly all-closed; a role id = open). Layout is CSS-only (TimelineNode/StoryCard), so the
 * statically-prerendered HTML is already correct for both the ≥1024 horizontal grid and the <1024
 * vertical accordion — the client only hydrates behaviour, never re-lays-out on mount.
 *
 * Screen states (Design.md a11y row ~306): this view has no async data source, so its states are
 * "working" (a card open) and "collapsed" (all closed) — there is no loading/empty/error to design.
 * The all-closed default reads as a clean, self-explanatory set of expandable nodes; the open state
 * is a labelled region. (Reasoning recorded in docs/reports/TKT-41.md.)
 */
export function ExperienceTimeline() {
  const hashRole = useSyncExternalStore(subscribeHash, getHashSnapshot, getHashServerSnapshot);
  const [userOpenId, setUserOpenId] = useState<string | null | undefined>(undefined);
  const reduced = useReducedMotionSafe();

  // Before the user touches anything, the hash drives which card is open; after any interaction, the
  // user's choice wins (exactly one open — AC 3).
  const openId = userOpenId === undefined ? hashRole : userOpenId;

  const nodeRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const didMount = useRef(false);
  const deepLinkHandled = useRef(false);

  // Scroll + focus the deep-linked card once, after it has actually mounted (content renders only
  // when open). Only fires for a hash-driven open (`userOpenId === undefined`), so a normal
  // click-to-open never yanks the viewport. Pure DOM side effects — no setState here.
  useEffect(() => {
    if (deepLinkHandled.current) return;
    if (userOpenId !== undefined || !openId) return;
    deepLinkHandled.current = true;
    const card = document.getElementById(storyCardId(openId))?.querySelector<HTMLElement>("[data-story-card]");
    card?.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" });
    card?.focus();
  }, [openId, userOpenId, reduced]);

  // Keep the URL hash in step with the open card (AC 2). Skip the first commit so a fresh load with
  // no hash is never rewritten; thereafter open → `#experience-<id>`, closed → `#experience`.
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    const hash = openId ? `#${storyCardId(openId)}` : `#${SECTION_ANCHOR}`;
    if (window.location.hash !== hash) {
      window.history.replaceState(null, "", hash);
    }
  }, [openId]);

  const handleToggle = useCallback((id: string) => {
    setUserOpenId((current) => toggleOpen(current === undefined ? getHashSnapshot() : current, id));
  }, []);

  const closeAndFocus = useCallback((id: string) => {
    setUserOpenId(null);
    nodeRefs.current[id]?.focus();
  }, []);

  // Delegated keyboard handling for the rail: Esc closes + returns focus; arrows rove between nodes.
  const onRailKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Escape") {
        if (!openId) return;
        event.preventDefault();
        closeAndFocus(openId);
        return;
      }

      const target = event.target as HTMLElement;
      const indexAttr = target.getAttribute?.("data-node-index");
      if (indexAttr == null) return;

      let delta: 1 | -1;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") delta = 1;
      else if (event.key === "ArrowLeft" || event.key === "ArrowUp") delta = -1;
      else return;

      event.preventDefault();
      const next = nextNodeIndex(Number(indexAttr), delta, IDS.length);
      nodeRefs.current[IDS[next]!]?.focus();
    },
    [openId, closeAndFocus],
  );

  return (
    <Section id={SECTION_ANCHOR} aria-labelledby="experience-heading">
      <SectionHeading
        id="experience-heading"
        eyebrow="Experience"
        title="Where I've built"
        lead="Four roles, newest to oldest — open any node for the context, scale, and what changed."
        className="mb-[var(--space-8)]"
      />

      {/* The rail: a vertical accordion <1024 (connecting line at a 24px left inset) and a
          horizontal grid ≥1024 (nodes in row 1, the open StoryCard spanning row 2, full width). */}
      <div
        onKeyDown={onRailKeyDown}
        className="relative flex flex-col before:absolute before:left-[var(--space-5)] before:top-[var(--space-2)] before:bottom-[var(--space-2)] before:w-px before:-translate-x-1/2 before:bg-ink-soft before:content-[''] lg:grid lg:grid-cols-4 lg:gap-x-0 lg:before:hidden"
      >
        {experience.map((role, index) => (
          <div key={role.id} className="contents">
            <TimelineNode
              ref={(el) => {
                nodeRefs.current[role.id] = el;
              }}
              role={role}
              index={index}
              isOpen={openId === role.id}
              onToggle={() => handleToggle(role.id)}
            />
            <StoryCard role={role} isOpen={openId === role.id} onClose={() => closeAndFocus(role.id)} />
          </div>
        ))}
      </div>
    </Section>
  );
}
