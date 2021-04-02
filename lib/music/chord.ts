import { BEAT_LENGTHS_RE, Note, renderNote } from "./note";

enum Qualifier {
  Major = "",
  Minor = "m",
  Diminished = "dim",
  Augmented = "aug",
}

enum Extension {
  None = "",
  Six = "6",
  Seven = "7",
  MajorSeven = "maj7",
}

const CHORD_RE = new RegExp(
  `^(${Object.values(Note).join("|")})` +
    `(${Object.values(Qualifier).join("|")})` +
    `(${Object.values(Extension).join("|")})` +
    `${BEAT_LENGTHS_RE}$`
);

const ONLY_BEATS_RE = new RegExp(`^${BEAT_LENGTHS_RE}$`);

export class Chord {
  constructor(
    readonly root: Note,
    readonly qualifier: Qualifier = Qualifier.Major,
    readonly extension: Extension = Extension.None
  ) {}

  // Parses a chord. Returns null for an empty string. Allows trailing dots and
  // commas but otherwise throws an error if parsing fails.
  static parse(chord: string): Chord | null {
    if (ONLY_BEATS_RE.exec(chord)) return null;
    const match = CHORD_RE.exec(chord);
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
    if (!this.root) return "";
    return this.root + this.qualifier + this.extension;
  }

  get base() {
    let base = renderNote(this.root);
    switch (this.qualifier) {
      case Qualifier.Minor:
        base += this.qualifier;
        break;
      case Qualifier.Augmented:
        base += "+";
        break;
    }
    return base;
  }

  get sup() {
    let sup = this.qualifier === Qualifier.Diminished ? "o" : "";
    switch (this.extension) {
      case Extension.Six:
      case Extension.Seven:
        sup += this.extension;
        break;
      case Extension.MajorSeven:
        sup += "M7";
        break;
    }
    return sup;
  }
}
