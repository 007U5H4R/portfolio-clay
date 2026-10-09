import { site } from "@/lib/site";
import { FrontArt } from "./CardArt";
import styles from "./card.module.css";

/** The front: the folded-paper panther over the identity type (TASK-180). */
export function CardFront({ hidden }: { hidden: boolean }) {
  return (
    <div className={`${styles.face} ${styles.front}`} inert={hidden} data-face="front">
      <FrontArt />
      <i className={styles.texture} aria-hidden="true" />
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
