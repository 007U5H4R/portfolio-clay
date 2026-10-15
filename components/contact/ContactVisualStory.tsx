import { Annotation } from "@/components/paper/Annotation";
import { Sticky } from "@/components/paper/Sticky";

type ArtProps = { className: string; src: string; width: number; height: number; alt?: string };

/** Below-the-fold art: lazy, decoded off-thread, with its intrinsic size so the box is reserved (no CLS). */
function ArtImg({ className, src, width, height, alt = "" }: ArtProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- pre-sized WebP written by the sharp pipeline; the optimizer would only re-encode it
    <img className={className} src={src} width={width} height={height} alt={alt} loading="lazy" decoding="async" />
  );
}

/**
 * The left-hand visual story (TASK-113, Tushar's contact spec 2026-09-27 §4–§7, §14, §21): what's
 * left on the desk — a handwritten note, an airmail envelope, a travel postcard, a coffee, a sprig,
 * a small Tushky paw stamp — then the sticky and the closing hand line.
 *
 * TASK-214: the desk objects are generated, text-free 3D paper-craft cut-outs (public/media/contact/;
 * provenance in docs/reports/TASK-214.md) — an envelope + postcard group, a coffee cup, one sprig and a
 * paw — while every word stays real HTML (the note, the sticky, the closing line).
 *
 * Decoration count (EVAL-018, Design.md §3.3 `/contact` · `section#contact` = 4 with the head's
 * subline annotation): **collage** (one object — note, paw and the desk art are its pieces and carry
 * no `data-decor`; the sticky, a counted decoration of its own, sits on the desk so it can overlap the
 * cup) · **sticky** · **annotation** (closing line; its terracotta stroke is drawn inside it).
 * Everything here is `aria-hidden` (a decoration, Design.md §3.2) and restates nothing the page needs
 * (the page has no form by construction; "one message" is the card's email). Server component; the
 * entrance is CSS (`ContactEntrance`).
 */
export function ContactVisualStory() {
  return (
    <div className="cx-story">
      <div className="cx-collage" data-decor="collage" aria-hidden="true">
        <p className="cx-note font-hand">
          Waving from the window seat —
          <br />
          the coffee’s usually on
          <br />
          and I’m always up for
          <br />a good conversation.
          <ArtImg className="cx-paw" src="/media/contact/paw.webp" width={200} height={194} />
        </p>

        <div className="cx-desk">
          <ArtImg
            className="cx-art cx-art-mail"
            src="/media/contact/envelope-postcard.webp"
            width={928}
            height={633}
            alt="A cream airmail envelope with a navy and terracotta border, overlapped by a taped postcard of a layered paper mountain landscape."
          />
          <ArtImg
            className="cx-art cx-art-sprig"
            src="/media/contact/sprig.webp"
            width={518}
            height={600}
            alt="A folded paper sprig with green leaves."
          />
          <ArtImg
            className="cx-art cx-art-cup"
            src="/media/contact/coffee-cup.webp"
            width={666}
            height={623}
            alt="A faceted paper coffee cup on a saucer."
          />
          <Sticky rotate={-3} className="cx-sticky">
            No forms.
            <br />
            No funnels.
            <br />
            Just say hello.
            <svg className="cx-smile" viewBox="0 0 32 20" focusable="false">
              <path d="M4 5 C 10 18, 22 18, 28 5" />
            </svg>
          </Sticky>
        </div>
      </div>

      <Annotation rotate={-1} className="cx-closing">
        Good conversations usually start
        <br />
        with one message.
        <svg className="cx-stroke" viewBox="0 0 240 14" preserveAspectRatio="none" focusable="false">
          <path d="M3 9 C 60 3, 120 12, 180 6 C 205 4, 225 6, 237 8" />
        </svg>
      </Annotation>
    </div>
  );
}
