import React from "react";
import styles from "./Song.module.scss";

enum Note {
  C = "C",
  D = "D",
  E = "E",
  F = "F",
  G = "G",
  A = "A",
  B = "B",
  Cis = "C#",
  Dis = "D#",
  Fis = "F#",
  Gis = "G#",
  Ais = "A#",
  Des = "Db",
  Es = "Eb",
  Ges = "Gb",
  Aes = "Ab",
  Bes = "Bb",
}

enum Qualifier {
  Major = "",
  Minor = "m",
}

enum Extension {
  None = "",
  Seventh = "7",
}

const PARSE_CHORD_RE = new RegExp(
  `^(${Object.values(Note).join("|")})` +
    `(${Object.values(Qualifier).join("|")})` +
    `(${Object.values(Extension).join("|")})$`
);

function renderNote(note: Note) {
  return note.replace("#", "♯").replace("b", "♭");
}

export class Chord {
  constructor(
    readonly root: Note,
    readonly qualifier?: Qualifier,
    readonly extension?: Extension
  ) {}

  static fromString(chord: string) {
    const match = PARSE_CHORD_RE.exec(chord);
    if (match == null) {
      throw new Error(`Failed to parse chord from ${chord}.`);
    }
    return new Chord(
      match[1] as Note,
      match[2] as Qualifier,
      match[3] as Extension
    );
  }

  toString() {
    return this.root + this.qualifier + this.extension;
  }

  Render = () => {
    const base = renderNote(this.root) + this.qualifier;
    const sup = this.extension;
    return (
      <span className={styles.chord}>
        {base}
        {sup ? <sup>{sup}</sup> : <></>}
      </span>
    );
  };
}
