import React from "react";
import {
  FaLongArrowAltDown,
  FaLongArrowAltUp,
  FaTimes,
  FaExchangeAlt,
} from "react-icons/fa";
import { Chord, ChordLib, Strum, StrumType } from "../../lib/music";
import styles from "./Strum.module.scss";

export const STRING_SEP = 0.4;

function fretToString(fret?: number): string {
  if (fret == null) return "";
  if (fret >= 0) return `${fret}`;
  return "X";
}

export function stringHeight(string: number) {
  return `${STRING_SEP * 2 * (string - 1) - 0.9}em`;
}

export interface StrumComponentProps {
  strum: Strum;
  chord?: Chord | null;
  chordLib?: ChordLib;
}

function PluggedStrum({ strum, chord, chordLib }: StrumComponentProps) {
  let strings = strum.strings?.slice() ?? [];
  let frets: string[] = [];
  if (chordLib && chord) {
    strings = strings.map((i) => chordLib?.replaceRootString(i, chord));
    const chordFrets = chordLib.getFrets(chord);
    frets = strings.map((string) => fretToString(chordFrets?.[string - 1]));
  } else {
    for (let i = 0; i < strings.length; i++) {
      if (!strings[i]) {
        strings[i] = 1.5;
        frets[i] = "R";
      }
    }
  }
  return (
    <div className={styles.tabStrum}>
      {strings.map((string, i) => (
        <div
          key={i}
          className={styles.string}
          style={{
            bottom: stringHeight(string),
          }}
        >
          {frets[i] ?? <span style={{ fontSize: "80%" }}>⬤</span>}
        </div>
      ))}
    </div>
  );
}

export default function StrumComponent({
  strum,
  chord,
  chordLib,
}: StrumComponentProps) {
  let classes = [styles.strum];
  if (strum.emphasize) classes.push(styles.emStrum);

  switch (strum.type) {
    case StrumType.Down:
      return (
        <div className={classes.join(" ")}>
          <FaLongArrowAltDown />
        </div>
      );
    case StrumType.Up:
      return (
        <div className={classes.join(" ")}>
          <FaLongArrowAltUp className={classes.join(" ")} />
        </div>
      );
    case StrumType.Percursion:
      return (
        <div className={classes.join(" ")}>
          <FaTimes className={classes.join(" ")} />
        </div>
      );
    case StrumType.Arpeggio:
      return (
        <div className={classes.join(" ")}>
          <FaLongArrowAltDown
            style={{ transform: "scale(1.2) rotate(-30deg)" }}
          />
        </div>
      );
    case StrumType.Tremolo:
      return (
        <div className={classes.join(" ")}>
          <FaExchangeAlt
            style={{ transform: "rotate(-90deg) scaleX(0.9) scaleY(-1.1)" }}
          />
        </div>
      );
    case StrumType.Plugged:
      return <PluggedStrum strum={strum} chord={chord} chordLib={chordLib} />;
    case StrumType.Tab:
      return (
        <div className={styles.tabStrum}>
          {strum.frets.map((fret, string) => (
            <div
              key={string}
              className={styles.string}
              style={{
                bottom: stringHeight(string + 1),
              }}
            >
              {fret < 0 ? "" : fret}
            </div>
          ))}
        </div>
      );
    case StrumType.Pause:
    default:
      return <div className={classes.join(" ")} />;
  }
}
