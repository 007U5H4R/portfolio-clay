import { site } from "@/lib/site";
import { FrontArt } from "./CardArt";
import styles from "./card.module.css";

/** The front: the folded-paper panther over the identity type (TASK-180). */
export function CardFront({ hidden }: { hidden: boolean }) {
  return (
    <div className={`${styles.face} ${styles.front}`} inert={hidden} data-face="front">
      {/* grain sits UNDER the art: WebKit drops mix-blend-mode inside the 3D flip, so a grain layer above the
          panther painted as a 50% cream veil and washed it out in Safari (TASK-180, 2026-10-09) */}
      <i className={styles.texture} aria-hidden="true" />
      <FrontArt />
      <span className={styles.mono} aria-hidden="true">TP</span>
      <div className={styles.type}>
        <p className={styles.name}>{site.name}</p>
        <p className={styles.role}>{site.title}</p>
        <p className={styles.micro}>Product · AI · Builder</p>
      </div>
      <i className={styles.sheen} aria-hidden="true" />
    </div>
  );
}
