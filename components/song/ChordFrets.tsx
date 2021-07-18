import { Chord, ChordInput, ChordLib } from "../../lib/music";
import { assert } from "../../lib/util";
import BackgroundGrid from "../elements/BackgroundGrid";
import styles from "./Chord.module.scss";

interface FretProps {
  string: number;
  fret: number;
  min?: number;
  char?: number | string;
}

function Fret({ string, fret, min, char }: FretProps) {
  char = char ?? "⬤";
  min = min || 1;
  let y = fret - min;
  if (fret < 0) {
    char = "X";
    y = -0.5;
  } else if (fret === 0) {
    char = "⭘";
    y = -0.5;
  }
  const left = `${string * 12 - 8}px`;
  const top = `${16 * y - 1}px`;
  return (
    <div className={styles.fret} style={{ left, top }}>
      {char}
    </div>
  );
}

export interface ChordFretsProps {
  chord: ChordInput;
  chordLib: ChordLib;
}

// TODO: Properly display the chord frets.
export default function ChordFrets({ chord, chordLib }: ChordFretsProps) {
  if (typeof chord === "string") {
    chord = Chord.parse(chord)!;
  }
  const frets = chordLib.getFrets(chord);
  assert(frets, `Failed to load frets for chord ${chord.toString()}`);
  let min = 0;
  let max = 0;
  for (let fret of frets) {
    if (fret <= 0) continue;
    if (min === 0 || min > fret) min = fret;
    if (max < fret) max = fret;
  }

  if (max <= 3) {
    min = 1;
    max = 3;
  } else if (max - min < 2) {
    max = min + 2;
  }

  const cols = frets.length - 1;
  const rows = max - min + 1;
  const width = `${12 * cols}px`;
  const height = `${16 * rows}px`;

  return (
    <div className={styles.chordFrets}>
      <div className={`${styles.chord} mb-2`}>
        {chord.base}
        {chord.sup ? <sup>{chord.sup}</sup> : null}
      </div>
      <div style={{ width, height, position: "relative" }}>
        <BackgroundGrid cols={cols} rows={rows} />
        {frets.map((f, i) => (
          <Fret key={i} fret={f} string={i} min={min} />
        ))}
        {min > 1 ? <Fret fret={1} string={-0.75} char={min} /> : null}
      </div>
    </div>
  );
}
