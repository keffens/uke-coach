import { Chord } from "../../lib/music";
import styles from "./Song.module.scss";

export interface ChordComponentProps {
  chord?: Chord | null;
}

export default function ChordComponent({ chord }: ChordComponentProps) {
  if (!chord) {
    return <span className={styles.chord}>&nbsp;</span>;
  }
  return (
    <span className={styles.chord}>
      {chord.base}
      {chord.sup ? <sup>{chord.sup}</sup> : <></>}
    </span>
  );
}
