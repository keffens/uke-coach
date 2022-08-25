import React from "react";
import {
  ArpeggioDown,
  DownStrum,
  Percursion,
  Tremolo,
  UpStrum,
} from "../icons";
import { Chord, ChordLib, Strum, StrumType } from "../../lib/music";
import styles from "./Strum.module.scss";

export const STRING_SEP = 0.4;
export const STRUM_SIZE_PX = 20;

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
          {/* TODO: Make sure this works on other browsers / systems. */}
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
      return <DownStrum className={classes.join(" ")} />;
    case StrumType.Up:
      return <UpStrum className={classes.join(" ")} />;
    case StrumType.Percursion:
      return <Percursion className={classes.join(" ")} />;
    case StrumType.Arpeggio:
      return <ArpeggioDown className={classes.join(" ")} />;
    case StrumType.Tremolo:
      return <Tremolo className={classes.join(" ")} />;
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
