import { Sticky } from "@/components/paper/Sticky";

/**
 * The essay's margin column (TKT-84 S84.02, Design.md §7.6): one generic sticky aside, the same line
 * on every essay — it is the `/thinking` opener's hand-sub, so it carries nothing that appears
 * nowhere else (§3.2 rule 6). Unit count: 1.
 *
 * Not rendered (and why): the §7.6 pinned `scene-thinking` photo + its caption annotation — TKT-95's
 * `SceneOpener` already opens every essay with that scene (EXE-18 / Dev-24), so pinning the same
 * picture again in the margin would duplicate it. Without the photo the column holds only an
 * `aria-hidden` sticky, so it is a plain `div`, not an `aside aria-label="Pinned to the margin"`
 * landmark (an empty landmark would only add noise to a screen reader's landmark list).
 */
export function EssayMargin() {
  return (
    <div className="essay-margin">
      <Sticky tone="kraft" rotate={3} className="essay-margin-sticky">
        Notes first. Essays later.
      </Sticky>
    </div>
  );
}
