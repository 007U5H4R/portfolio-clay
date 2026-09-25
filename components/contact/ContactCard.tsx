import { ArrowUpRight, MapPin } from "lucide-react";
import { CopyButton } from "@/components/common/CopyButton";
import { VisuallyHidden } from "@/components/common/VisuallyHidden";
import { Container } from "@/components/layout/Container";
import { Annotation } from "@/components/paper/Annotation";
import { Hand } from "@/components/paper/Hand";
import { Sticky } from "@/components/paper/Sticky";
import { resumeAction, site } from "@/lib/site";

/**
 * `/contact` opener (TSK-46, Design.md §7.8; decisions S10 — no form, EXE-8 — email + LinkedIn only).
 *
 * Sits directly under TKT-95's `SceneOpener` (EXE-18 / Dev-24): the full-bleed banner already shows
 * `scene-contact`, so the §7.8 taped portrait is **not** rendered here (a second copy of the same
 * picture). Its caption annotation stays, as the banner's caption (same as the home hero's scene
 * caption, §3.3 `/` hero). The `44fr 56fr` grid keeps the mockup's rhythm: the caption + the sticky
 * "No form here…" in the narrow column, the copy in the wide one. < 900 it stacks copy-first.
 *
 * Unit count (EVAL-018, §3.3 `/contact` opener = 3): caption annotation · sticky · "whichever is
 * easiest for you ↓" annotation. All three are `aria-hidden`; none carries information the page
 * doesn't state elsewhere ("no form" is also true by construction — there is none).
 *
 * Actions (`<ul>`, dashed rules, Caveat numerals — `aria-hidden` spans, not `data-hand="label"`:
 * §3.4 labels live inside a `data-paper` object and this list is not one):
 *   01 address + `CopyButton` (idle → copied 2 s → error + selectable `<output>`; sr-only live region)
 *   02 primary "Email me →" `mailto:` (Caveat cta, `data-hand="cta"`)
 *   03 secondary "LinkedIn ↗" — `target=_blank rel="noopener noreferrer"` + sr-only "(opens in new tab)"
 *   04 `#resume` — `resumeAction()` (PB5 single source) + its visible note while no PDF exists.
 *
 * Location line "Bengaluru, India" renders only behind `site.showLocation` (default `false`, the
 * same flag the band reads — TKT-72 / HANDOFF §6). No phone, DOB or address anywhere (EXE-8).
 */
export function ContactCard() {
  const resume = resumeAction();

  return (
    <section id="contact" className="contact-opener" aria-labelledby="contact-h">
      <Container className="contact-grid">
        <div className="contact-aside">
          <Annotation rotate={-1.2} className="contact-caption">
            waving from the window seat — the coffee&apos;s usually on
          </Annotation>
          <Sticky rotate={3} className="contact-sticky">
            No form here. A plain email is the whole process.
          </Sticky>
        </div>

        <div className="contact-copy">
          <p className="contact-eyebrow">Contact</p>
          <h1 id="contact-h" className="contact-h1">
            Still curious?
          </h1>
          <Annotation size="lg" rotate={-1.2} className="contact-hand-aside">
            whichever is easiest for you ↓
          </Annotation>

          <ul className="contact-actions" data-contact-actions="">
            <li className="contact-action">
              <span className="contact-num font-hand" aria-hidden="true">
                01
              </span>
              <span className="contact-addr">{site.email}</span>
              <CopyButton value={site.email} className="contact-copy-control" />
            </li>
            <li className="contact-action">
              <span className="contact-num font-hand" aria-hidden="true">
                02
              </span>
              <a className="contact-btn contact-btn-primary focus-ring" href={`mailto:${site.email}`}>
                <Hand kind="cta">Email me →</Hand>
              </a>
            </li>
            <li className="contact-action">
              <span className="contact-num font-hand" aria-hidden="true">
                03
              </span>
              <a
                className="contact-btn contact-btn-secondary focus-ring"
                href={site.linkedin}
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
                <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden="true" />
                <VisuallyHidden>(opens in new tab)</VisuallyHidden>
              </a>
            </li>
            <li id="resume" className="contact-action contact-action-resume">
              <span className="contact-num font-hand" aria-hidden="true">
                04
              </span>
              <a
                className="contact-btn contact-btn-secondary focus-ring"
                href={resume.href}
                download={resume.download || undefined}
                title={resume.note}
              >
                {resume.label}
              </a>
              {resume.note ? <p className="contact-note">{resume.note}</p> : null}
            </li>
          </ul>

          {site.showLocation ? (
            <p className="contact-location">
              <MapPin size={16} strokeWidth={1.75} aria-hidden="true" />
              Bengaluru, India
            </p>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
