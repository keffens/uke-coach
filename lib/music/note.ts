/** All standard notes. */
export enum Note {
  C = "C",
  D = "D",
  E = "E",
  F = "F",
  G = "G",
  A = "A",
  B = "B",
  Csharp = "C#",
  Dsharp = "D#",
  Fsharp = "F#",
  Gsharp = "G#",
  Asharp = "A#",
  Dflat = "Db",
  Eflat = "Eb",
  Gflat = "Gb",
  Aflat = "Ab",
  Bflat = "Bb",
}

/** Identity between sharp and flat notes. */
export const NOTE_IDENTITY = new Map<Note, Note>([
  [Note.Csharp, Note.Dflat],
  [Note.Dsharp, Note.Eflat],
  [Note.Fsharp, Note.Gflat],
  [Note.Gsharp, Note.Aflat],
  [Note.Asharp, Note.Bflat],
  [Note.Dflat, Note.Csharp],
  [Note.Eflat, Note.Dsharp],
  [Note.Gflat, Note.Fsharp],
  [Note.Aflat, Note.Gsharp],
  [Note.Bflat, Note.Asharp],
]);

function isSharp(note: Note) {
  return note.endsWith("#");
}

function isFlat(note: Note) {
  return note.endsWith("b");
}

/** Converts a sharp note to a flat note if possible. */
export function toFlat(note: Note): Note {
  if (isSharp(note)) return NOTE_IDENTITY.get(note);
  return note;
}

/** Converts a flat note to a sharp note if possible. */
export function toSharp(note: Note): Note {
  if (isFlat(note)) return NOTE_IDENTITY.get(note);
  return note;
}

/** Renders a note for display on the web using unicode ♯ and ♭. */
export function renderNote(note: Note | string): string {
  return note.replace("#", "♯").replace("b", "♭");
}

/** Scale of the key, currently restircted to major and minor. */
export enum Scale {
  Major = "",
  Minor = "m",
}

const PARSE_NOTE_RE = new RegExp(
  String.raw`^(${Object.values(Note).join("|")})(-1|\d)?$`
);

const NOTE_TO_INT = new Map<Note, number>([
  [Note.C, 0],
  [Note.Csharp, 1],
  [Note.Dflat, 1],
  [Note.D, 2],
  [Note.Dsharp, 3],
  [Note.Eflat, 3],
  [Note.E, 4],
  [Note.F, 5],
  [Note.Fsharp, 6],
  [Note.Gflat, 6],
  [Note.G, 7],
  [Note.Gsharp, 8],
  [Note.Aflat, 8],
  [Note.A, 9],
  [Note.Asharp, 10],
  [Note.Bflat, 10],
  [Note.B, 11],
]);

const INT_TO_NOTE = new Map<number, Note>([
  [0, Note.C],
  [1, Note.Csharp],
  [2, Note.D],
  [3, Note.Dsharp],
  [4, Note.E],
  [5, Note.F],
  [6, Note.Fsharp],
  [7, Note.G],
  [8, Note.Gsharp],
  [9, Note.A],
  [10, Note.Asharp],
  [11, Note.B],
]);

/** Octave number in scientific notation. */
export type Octave = -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

/** Represents a note with an octave. */
export class PitchedNote {
  private static MAX_NOTE = 12 * 10 - 1;
  private static MIN_NOTE = -12;

  private constructor(
    private readonly value: number,
    private readonly useFlat: boolean
  ) {}

  /**
   * Creates a pitched note from a note and octave value. If useFlat is not
   * specifies, it's default is whether the major scale uses flats.
   */
  static fromNote(
    note: Note,
    octave: Octave = 4,
    useFlat?: boolean
  ): PitchedNote {
    return new PitchedNote(
      octave * 12 + NOTE_TO_INT.get(note),
      useFlat ?? (isFlat(note) || note === Note.F)
    );
  }

  /** Parses a PitchedNote from a string. */
  static parse(note: string): PitchedNote {
    const match = PARSE_NOTE_RE.exec(note);
    if (!match) {
      throw new Error(`Failed to parse "${note}" as PitchedNote.`);
    }
    let octave = parseInt(match[2]);
    if (isNaN(octave)) octave = 4;
    return PitchedNote.fromNote(match[1] as Note, octave as Octave);
  }

  /** Returns the note. */
  get note(): Note {
    const note = INT_TO_NOTE.get(((this.value % 12) + 12) % 12);
    if (this.useFlat) return toFlat(note);
    return note;
  }

  /** Returns the octave. */
  get octave(): Octave {
    return Math.floor(this.value / 12) as Octave;
  }

  /** Returns a string version, like "C4", "Db8", "A#-1". */
  toString(): string {
    return `${this.note}${this.octave}`;
  }

  /**
   * Returns a new note pitched note with the given interval. When the note is
   * a sharp/flat note, uses useFlat note to determine wheter to return the flat
   * or sharp version.
   */
  addSemitones(i: number): PitchedNote {
    let val = this.value + i;
    while (val > PitchedNote.MAX_NOTE) val -= 12;
    while (val < PitchedNote.MIN_NOTE) val += 12;
    return new PitchedNote(val, this.useFlat);
  }

  /** Like addSemitones but for an array of semitone intervals. */
  makeChord(intervals: Array<number>): Array<PitchedNote> {
    return intervals.map((i) => this.addSemitones(i));
  }
}

const BEAT_LENGTHS = new Map<string, number>([
  [".", 1], // quarter note in 4/4
  [",", 1 / 2], // eigth note in 4/4
  [":", 1 / 4], // sixteenth note in 4/4
  [";", 1 / 8], // thirty-second note in 4/4
  ["'", 2 / 3], // quarter triplet in 4/4
  ['"', 1 / 3], // eigth triplet in 4/4
]);

/**
 * Maximum number of strums or units per beat. Also the least common multiple of
 * supported note lengths.
 */
export const TICKS_PER_BEAT = 24;

/** RegExp pattern to accept all allowed beat values */
export const BEAT_LENGTHS_PATTERN = `[_.,:;'"]*`;

/**
 * Parses beats from a string ignoring all symbols which don't represent beat
 * values.
 */
export function parseBeats(value: string, beatsInBar = 4): number {
  let sum = 0;
  for (let i = 0; i < value.length; i++) {
    if (value[i] === "_") {
      sum += beatsInBar;
    } else {
      sum += BEAT_LENGTHS.get(value[i]) ?? 0;
    }
  }
  return sum || beatsInBar;
}

/**
 * Use to sum an array of beat values. Ensures triplet notes are correctly
 * summed to intergers.
 */
export function sumBeats(beats: number[]): number {
  const sum = beats.reduce((a, b) => a + b, 0);
  return Math.round(sum * TICKS_PER_BEAT) / TICKS_PER_BEAT;
}
