import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { DraftTag, Hand, TornEdge } from "@/components/paper";
import { hero } from "@/data/hero";
import { projects } from "@/data/projects";
import { resumeAction, site } from "@/lib/site";

/**
 * S5 — the GitHub circle renders only while at least one project links a public repo (and the
 * site-level `github` URL is set). Computed from `data/projects.ts` at build time.
 */
export function showGithub(): boolean {
  return Boolean(site.github) && projects.some((project) => project.links.repoPublic);
}

/**
 * The terracotta band footer (Design.md §4.2; decisions S16, S18, S5; TKT-72). The single closing
 * CTA on every route — the old home closing-CTA section and two-tier footer are gone. Server component.
 *
 * Markup is §4.2 verbatim: torn top (the band's one counted decoration, §3.3) → body on terracotta
 * + `--band-hatch`: eyebrow · h2 "Let's *build* / something people can use." (line 2 in kraft,
 * Dev-13) · DRAFT hiring line · Email + Social row · © bar with `hero.tagline` as a sourced hand
 * quote (S18 — previously defined but never rendered) and "Bengaluru, India" behind
 * `site.showLocation` (default false, HANDOFF §6).
 *
 * Only the approved public contact (email → `/contact`, LinkedIn) appears — no phone/DOB/address
 * (EXE-8). The résumé circle derives from `resumeAction()` (PB5). The D8-fallback "Playground" band
 * link is deliberately not added (D8 default = five-item header nav; E-20: it would be one `<li>`).
 */
export function BandFooter() {
  const resume = resumeAction();
  const github = showGithub();

  return (
    <footer className="band" aria-labelledby="band-h">
      <TornEdge fill="terracotta" className="band-torn" />
      <div className="band-body">
        <Container className="band-wrap">
          <p className="band-eyebrow">Let&apos;s connect</p>
          <h2 id="band-h" className="band-h">
            Let&apos;s <em>build</em>
            <br />
            <span className="dim">something people can use.</span>
          </h2>
          <p className="band-hire">
            Hiring for PM, AI PM or AI-builder roles? Say hi. <DraftTag tone="onBand" />
          </p>

          <div className="band-row">
            <div>
              <span className="band-label">Email</span>
              <Link href="/contact" className="band-email focus-ring">
                {site.email}
              </Link>
            </div>
            <div>
              <span className="band-label" id="band-social-label">
                Social
              </span>
              <ul className="band-social" aria-labelledby="band-social-label">
                <li>
                  <a href={site.linkedin} aria-label="LinkedIn" target="_blank" rel="noopener noreferrer" className="focus-ring">
                    <span className="band-in" aria-hidden="true">
                      in
                    </span>
                  </a>
                </li>
                {github ? (
                  <li>
                    <a href={site.github} aria-label="GitHub" target="_blank" rel="noopener noreferrer" className="focus-ring">
                      <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
                      </svg>
                    </a>
                  </li>
                ) : null}
                <li>
                  <a
                    href={resume.href}
                    aria-label={resume.label}
                    title={resume.note}
                    download={resume.download || undefined}
                    className="focus-ring"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                      <path d="M6 2h8l6 6v14H6V2zm7 1.5V9h5.5L13 3.5zM8 12h8v1.6H8V12zm0 3.4h8V17H8v-1.6zm0 3.4h5.5v1.6H8v-1.6z" />
                    </svg>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="band-bar">
            <span>© 2026 Tushar Pathak. Built with curiosity, chai &amp; Claude Code.</span>
            <span className="band-tagline">
              <Hand kind="quote" as="span" cite={<span className="sr-only">Source: {hero.tagline.source}</span>}>
                {hero.tagline.text}
              </Hand>
            </span>
            {site.showLocation ? <span>Bengaluru, India</span> : null}
          </div>
        </Container>
      </div>
    </footer>
  );
}
