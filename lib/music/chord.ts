import { BEAT_LENGTHS_PATTERN, Note, PitchedNote, renderNote } from "./note";

enum Qualifier {
  Major = "",
  Minor = "m",
  Diminished = "dim",
  Augmented = "aug",
  Sus2 = "sus2",
  Sus4 = "sus4",
}

enum Extension {
  None = "",
  Six = "6",
  Seven = "7",
  MajorSeven = "maj7",
  AddNine = "add9",
}

function chordIntervals(
  qualifier: Qualifier,
  extension: Extension
): Array<number> {
  let semitones = [];
  switch (qualifier) {
    case Qualifier.Major:
      semitones = [0, 4, 7];
      break;
    case Qualifier.Minor:
      semitones = [0, 3, 7];
      break;
    case Qualifier.Diminished:
      return extension === Extension.Seven ? [0, 3, 6, 9] : [0, 3, 6];
    case Qualifier.Augmented:
      return extension === Extension.Seven ? [0, 4, 8, 10] : [0, 4, 8];
    case Qualifier.Sus2:
      semitones = [0, 2, 7];
      break;
    case Qualifier.Sus4:
      semitones = [0, 5, 7];
      break;
  }
  switch (extension) {
    case Extension.Six:
      semitones.push(9);
      break;
    case Extension.Seven:
      semitones.push(10);
      break;
    case Extension.MajorSeven:
      semitones.push(11);
      break;
    case Extension.AddNine:
      semitones.push(14);
  }
  return semitones;
}

const CHORD_RE = new RegExp(
  `^(${Object.values(Note).join("|")})` +
    `(${Object.values(Qualifier).join("|")})` +
    `(${Object.values(Extension).join("|")})` +
    `(${Object.values(Qualifier).join("|")})` +
    `${BEAT_LENGTHS_PATTERN}$`
);

const ONLY_BEATS_RE = new RegExp(`^${BEAT_LENGTHS_PATTERN}$`);

/** Represents one chord, independent of the instrument. */
export class Chord {
  constructor(
    readonly root: Note,
    readonly qualifier: Qualifier = Qualifier.Major,
    readonly extension: Extension = Extension.None
  ) {}

  /**
   * Parses a chord. Allows trailing beat characters. Returns null for only beat
   * chracters. Throws an error if the chord cannot be parsed.
   */
  static parse(chord: string): Chord | null {
    if (ONLY_BEATS_RE.exec(chord)) return null;
    const match = CHORD_RE.exec(chord);
    if (match == null) {
      throw new Error(`Failed to parse chord from ${chord}.`);
    }
    if (match[4]) {
      if (match[2]) {
        throw new Error(
          `Failed to parse chord from ${chord}: ` +
            `Got 2 qualifiers ${match[2]} and ${match[4]}.`
        );
      }
      match[2] = match[4];
    }
    return new Chord(
      match[1] as Note,
      match[2] as Qualifier,
      match[3] as Extension
    );
  }

  /** Returns the string representation of the chord. */
  toString(): string {
    if (!this.root) return "";
    if (
      this.qualifier === Qualifier.Sus2 ||
      this.qualifier === Qualifier.Sus4
    ) {
      return this.root + this.extension + this.qualifier;
    }
    return this.root + this.qualifier + this.extension;
  }

  /** In HTML the chord is diplayed as `base`<sup>`sup`</sup> */
  get base(): string {
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

  /** In HTML the chord is diplayed as `base`<sup>`sup`</sup> */
  get sup(): string {
    let sup = "";
    switch (this.extension) {
      case Extension.Six:
      case Extension.Seven:
        sup += this.extension;
        break;
      case Extension.MajorSeven:
        sup += "M7";
        break;
      case Extension.AddNine:
        sup += "add9";
        break;
    }
    switch (this.qualifier) {
      case Qualifier.Diminished:
        sup = "o" + sup;
        break;
      case Qualifier.Sus2:
      case Qualifier.Sus4:
        sup += this.qualifier;
        break;
    }
    return sup;
  }

  /** Returns the notes in this chord. */
  asPitchedNotes(minNote = PitchedNote.C4): Array<PitchedNote> {
    return minNote
      .getNext(this.root)
      .makeChord(chordIntervals(this.qualifier, this.extension));
  }

  /** Returns the root note of the chord. */
  rootNote(minNote = PitchedNote.C4): PitchedNote {
    return this.asPitchedNotes(minNote)[0];
  }
}
