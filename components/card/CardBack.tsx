import { qrPath, qrSize } from "@/lib/card/qr";
import { site } from "@/lib/site";
import { VCARD_PATH } from "@/lib/card/vcard";
import { BackArt } from "./CardArt";
import styles from "./card.module.css";

export interface CardBackProps {
  /** `${siteUrl()}/card` — what the QR encodes (EVAL-029). */
  url: string;
  /** Hidden-face flag: the face is `inert`, so its links leave the tab order until it is shown. */
  hidden: boolean;
}

const LINKS = [
  { label: "Email", href: `mailto:${site.email}`, external: false },
  { label: "LinkedIn", href: site.linkedin, external: true },
  { label: "Portfolio", href: "/", external: false },
  { label: "GitHub", href: site.github, external: true },
] as const;

/**
 * The back (§8, §16, §56, §57): paper landscape edge, a raised paper panel holding a flat,
 * high-contrast QR, "Keep me in your pocket.", Save contact, four public links, the monogram.
 * If the QR cannot be generated no panel renders at all — never an empty frame (§32).
 */
export function CardBack({ url, hidden }: CardBackProps) {
  const d = qrPath(url);
  const n = d ? qrSize(url) : 0;
  const quiet = 3;
  const box = n + quiet * 2;
  return (
    <div className={`${styles.face} ${styles.back}`} id="card-back" inert={hidden} data-face="back">
      <BackArt />
      <div className={styles.backBody}>
        {d ? (
          <div className={styles.qrPanel} data-qr-panel>
            <svg
              className={styles.qr}
              viewBox={`0 0 ${box} ${box}`}
              role="img"
              aria-label="QR code: opens Tushar Pathak's digital business card page"
              shapeRendering="crispEdges"
              data-qr
            >
              <rect width={box} height={box} className={styles.qrBg} />
              <path transform={`translate(${quiet} ${quiet})`} d={d} className={styles.qrInk} />
            </svg>
          </div>
        ) : null}
        <p className={styles.pocket}>Keep me in your pocket.</p>
        <a className={styles.save} href={VCARD_PATH} download data-save-contact>
          Save contact
        </a>
        <ul className={styles.links}>
          {LINKS.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <span className={styles.mono} aria-hidden="true">TP</span>
      </div>
      <i className={styles.texture} aria-hidden="true" />
    </div>
  );
}
