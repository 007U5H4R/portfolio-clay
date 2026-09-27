import { Annotation } from "@/components/paper/Annotation";
import { Sticky } from "@/components/paper/Sticky";

/**
 * The left-hand visual story (TASK-113, Tushar's contact spec 2026-09-27 §4–§7, §14, §21): what's
 * left on the desk — a handwritten note, an airmail envelope, a travel postcard, a coffee, a sprig,
 * a small Tushky paw stamp — then the sticky and the closing hand line.
 *
 * Decoration count (EVAL-018, Design.md §3.3 `/contact` · `section#contact` = 4 with the head's
 * subline annotation): **collage** (one object — note, paw, envelope, postcard, cup and sprig are its
 * pieces and carry no `data-decor`; the precedent is the hero marginalia / Dev-40 collages, which
 * hold their own Caveat notes) · **sticky** · **annotation** (closing line; its terracotta stroke is
 * drawn inside it). Everything here is `aria-hidden` and restates nothing the page needs (the page
 * has no form by construction; "one message" is the card's email). All art is inline SVG / CSS from
 * paper tokens — no generated image (EXE-19). Server component; the entrance is CSS (`ContactEntrance`).
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
          <svg className="cx-paw" viewBox="0 0 40 40" focusable="false">
            <ellipse cx="20" cy="27" rx="9" ry="7.5" />
            <ellipse cx="9" cy="17" rx="3.6" ry="4.6" transform="rotate(-18 9 17)" />
            <ellipse cx="16" cy="10.5" rx="3.6" ry="4.8" transform="rotate(-6 16 10.5)" />
            <ellipse cx="24.5" cy="10.5" rx="3.6" ry="4.8" transform="rotate(6 24.5 10.5)" />
            <ellipse cx="31.5" cy="17" rx="3.6" ry="4.6" transform="rotate(18 31.5 17)" />
          </svg>
        </p>

        <div className="cx-desk">
          <span className="cx-envelope">
            <svg className="cx-envelope-flap" viewBox="0 0 200 120" preserveAspectRatio="none" focusable="false">
              <path d="M2 4 L100 70 L198 4" />
            </svg>
            <span className="cx-envelope-lines">
              <i />
              <i />
              <i />
            </span>
            <span className="cx-envelope-stamp">
              <svg viewBox="0 0 40 48" focusable="false">
                <circle cx="20" cy="18" r="7" />
                <path d="M4 44 C 12 30, 20 30, 26 38 C 30 33, 34 32, 38 36" />
              </svg>
            </span>
            <span className="cx-postmark" />
          </span>

          <span className="cx-postcard">
            <svg viewBox="0 0 160 104" focusable="false">
              <rect className="cx-pc-sky" x="0" y="0" width="160" height="104" />
              <circle className="cx-pc-sun" cx="118" cy="30" r="13" />
              <path className="cx-pc-far" d="M0 70 L30 44 L52 60 L84 30 L118 62 L140 50 L160 64 V104 H0 Z" />
              <path className="cx-pc-near" d="M0 84 C 30 70, 60 78, 88 72 C 116 66, 140 74, 160 70 V104 H0 Z" />
              <path className="cx-pc-water" d="M0 94 C 40 88, 80 98, 160 90 V104 H0 Z" />
            </svg>
          </span>

          <svg className="cx-sprig" viewBox="0 0 200 260" focusable="false">
            <path className="cx-sprig-stem" d="M100 258 C 96 190, 84 120, 60 20" />
            <path d="M92 200 C 60 190, 30 160, 22 128 C 52 132, 80 160, 92 200 Z" />
            <path d="M88 160 C 118 146, 146 116, 150 84 C 120 90, 96 120, 88 160 Z" />
            <path d="M78 116 C 48 104, 30 76, 30 46 C 56 56, 74 84, 78 116 Z" />
            <path d="M70 76 C 92 60, 104 36, 102 8 C 80 20, 70 46, 70 76 Z" />
          </svg>

          <svg className="cx-cup" viewBox="0 0 132 120" focusable="false">
            <ellipse className="cx-cup-saucer" cx="60" cy="62" rx="56" ry="54" />
            <path className="cx-cup-handle" d="M94 50 C 118 46, 124 78, 96 76" />
            <circle className="cx-cup-rim" cx="60" cy="62" r="36" />
            <circle className="cx-cup-coffee" cx="60" cy="62" r="28" />
            <path className="cx-cup-crema" d="M46 58 C 52 50, 66 50, 72 58" />
          </svg>
        </div>
      </div>

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
