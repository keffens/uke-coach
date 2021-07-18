import React from "react";
import styles from "./Strum.module.scss";
import { stringHeight } from "./StrumComponent";
import { PitchedNote } from "../../lib/music";

export interface StringLabelsProps {
  enable: boolean;
  tuning: PitchedNote[];
}

export default function StringLabels({ enable, tuning }: StringLabelsProps) {
  if (!enable || !tuning) return null;
  const notes = tuning.map((note) => note.note);
  return (
    <span className={styles.stringLabel}>
      {notes.map((note, i) => (
        <div
          key={i}
          className={styles.string}
          style={{ bottom: stringHeight(i + 1) }}
        >
          {note}
        </div>
      ))}
    </span>
  );
}
