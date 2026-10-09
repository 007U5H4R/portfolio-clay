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
  { label: "Email", href: `mailto:${site.email}`, external: false, icon: "mail" },
  { label: "LinkedIn", href: site.linkedin, external: true, icon: "in" },
  { label: "Portfolio", href: "/", external: false, icon: "globe" },
  { label: "GitHub", href: site.github, external: true, icon: "branch" },
] as const;

/** Small stroke icons (decorative: the link text carries the name). */
function Icon({ name }: { name: "mail" | "in" | "globe" | "branch" | "person" }) {
  const paths = {
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3.5 7 8.5 6.5L20.5 7" /></>,
    in: <><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M8 10.5V17M8 7.4v.1M12 17v-6.5M12 13c0-1.6 1-2.6 2.4-2.6 1.5 0 2.1 1 2.1 2.6V17" /></>,
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></>,
    branch: <><circle cx="7" cy="6" r="2" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="9" r="2" /><path d="M7 8v8M17 11c0 4-6 3-10 5" /></>,
    person: <><circle cx="12" cy="8.5" r="3.5" /><path d="M5 20c.8-4 3.6-6 7-6s6.2 2 7 6" /></>,
  } as const;
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {paths[name]}
    </svg>
  );
}

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
            <i className={styles.bracket} data-b="tl" aria-hidden="true" />
            <i className={styles.bracket} data-b="tr" aria-hidden="true" />
            <i className={styles.bracket} data-b="bl" aria-hidden="true" />
            <i className={styles.bracket} data-b="br" aria-hidden="true" />
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
          <Icon name="person" />
          Save contact
        </a>
        <ul className={styles.links}>
          {LINKS.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                <Icon name={l.icon} />
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <i className={styles.texture} aria-hidden="true" />
    </div>
  );
}
