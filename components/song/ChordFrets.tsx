import { Chord, ChordInput, ChordLib } from "../../lib/music";
import styles from "./Chord.module.scss";

export interface ChordFretsProps {
  chord: ChordInput;
  chordLib: ChordLib;
}

// TODO: Properly display the chord frets.
export default function ChordFrets({ chord, chordLib }: ChordFretsProps) {
  if (typeof chord === "string") {
    chord = Chord.parse(chord)!;
  }
  const frets = chordLib.getStringFrets(chord);
  return (
    <div>
      <span className={styles.chord}>
        {chord.base}
        {chord.sup ? <sup>{chord.sup}</sup> : null}
      </span>{" "}
      ({frets?.join(",")})
    </div>
  );
}
