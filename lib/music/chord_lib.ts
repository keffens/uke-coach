import { assert } from "../util";
import { Chord } from "./chord";
import {
  compatibleWithDefaultTuning,
  getTuning,
  InstrumentType,
} from "./instrument_type";
import { NOTE_IDENTITY, PitchedNote, toSharp } from "./note";
import { Token, TokenType } from "./token";

/** Most functions in the chord lib support either a chord or a string */
export type ChordInput = Chord | string;

const UKULELE_CHORD_FRETS = new Map<string, number[]>([
  ["C", [0, 0, 0, 3]],
  ["Cm", [0, 3, 3, 3]],
  ["C7", [0, 0, 0, 1]],
  ["D", [2, 2, 2, 0]],
  ["Dm", [2, 2, 1, 0]],
  ["D7", [2, 2, 2, 3]],
  ["E", [4, 4, 4, -1]],
  ["Em", [0, 4, 3, 2]],
  ["E7", [1, 2, 0, 2]],
  ["F", [2, 0, 1, 0]],
  ["Fm", [1, 0, 1, 3]],
  ["F7", [2, 3, 1, 3]],
  ["G", [0, 2, 3, 2]],
  ["Gm", [0, 2, 3, 1]],
  ["G7", [0, 2, 1, 2]],
  ["A", [2, 1, 0, 0]],
  ["Am", [2, 0, 0, 0]],
  ["A7", [0, 1, 0, 0]],
  ["B", [4, 3, 2, 2]],
  ["Bm", [4, 2, 2, 2]],
  ["B7", [2, 3, 2, 2]],
  ["C#", [1, 1, 1, 4]],
  ["C#m", [-1, 4, 4, 4]],
  ["C#7", [1, 1, 1, 2]],
  ["D#", [0, 3, 3, 1]],
  ["D#m", [3, 3, 2, 1]],
  ["D#7", [3, 3, 3, 4]],
  ["F#", [3, 1, 2, 1]],
  ["F#m", [2, 1, 2, 0]],
  ["F#7", [3, 4, 2, 4]],
  ["G#", [5, 3, 4, 3]],
  ["G#m", [4, 3, 4, 2]],
  ["G#7", [1, 3, 2, 3]],
  ["A#", [3, 2, 1, 1]],
  ["A#m", [3, 1, 1, 1]],
  ["A#7", [1, 2, 1, 1]],
]);

const GUITAR_CHORD_FRETS = new Map<string, number[]>([
  ["C", [-1, 3, 2, 0, 1, 0]],
  ["Cm", [-1, 3, 5, 5, 4, 3]],
  ["C7", [-1, 3, 2, 3, 1, 0]],
  ["D", [-1, -1, 0, 2, 3, 2]],
  ["Dm", [-1, -1, 0, 2, 3, 1]],
  ["D7", [-1, -1, 0, 2, 1, 2]],
  ["E", [0, 2, 2, 1, 0, 0]],
  ["Em", [0, 2, 2, 0, 0, 0]],
  ["E7", [0, 2, 2, 1, 3, 0]],
  ["F", [1, 3, 3, 2, 1, 1]],
  ["Fm", [1, 3, 3, 1, 1, 1]],
  ["F7", [1, 3, 1, 2, 1, 1]],
  ["G", [3, 2, 0, 0, 0, 3]],
  ["Gm", [3, 5, 5, 3, 3, 3]],
  ["G7", [3, 2, 0, 0, 0, 1]],
  ["A", [-1, 0, 2, 2, 2, 0]],
  ["Am", [-1, 0, 2, 2, 1, 0]],
  ["A7", [-1, 0, 2, 2, 2, 3]],
  ["B", [-1, 2, 4, 4, 4, 2]],
  ["Bm", [-1, 2, 4, 4, 3, 2]],
  ["B7", [-1, 2, 1, 2, 0, 2]],
  ["C#", [-1, 4, 3, 1, 2, 1]],
  ["C#m", [-1, -1, 2, 1, 2, 0]],
  ["C#7", [-1, 4, 3, 4, 2, -1]],
  ["D#", [-1, -1, 1, 3, 4, 3]],
  ["D#m", [-1, -1, 1, 3, 4, 2]],
  ["D#7", [-1, -1, 1, 3, 2, 3]],
  ["F#", [2, 4, 4, 3, 2, 2]],
  ["F#m", [2, 4, 4, 2, 2, 2]],
  ["F#7", [2, 4, 2, 3, 2, 2]],
  ["G#", [-1, -1, 1, 1, 1, 4]],
  ["G#m", [4, 6, 6, 4, 4, 4]],
  ["G#7", [-1, -1, 1, 1, 1, 2]],
  ["A#", [-1, 1, 3, 3, 3, 1]],
  ["A#m", [-1, 1, 3, 3, 2, 1]],
  ["A#7", [-1, 1, 3, 1, 3, 1]],
]);

function toString(chord: ChordInput): string {
  if (chord instanceof Chord) return chord.toString();
  return chord;
}

function toChord(chord: ChordInput): Chord {
  if (chord instanceof Chord) return chord;
  const parsedChord = Chord.parse(chord);
  assert(parsedChord, `Failed to parse "${chord}" as Chord`);
  return parsedChord;
}

function fretsFromMap(
  fretMap: Map<string, number[]>,
  chord: string,
  altChord?: string
): number[] | null {
  let frets = fretMap.get(chord);
  if (frets) return frets;
  if (!frets && altChord) return fretMap.get(altChord) ?? null;
  return null;
}

/** Maps chords to frets, with the option to add custom chords. */
export class ChordLib {
  usedChords = new Set<string>();
  private costumChords = new Map<string, number[]>();

  private constructor(
    private instrumentChords: Map<string, number[]>,
    readonly tuning: PitchedNote[]
  ) {}

  /** Creates a new chord lib for a ukulele. */
  static forUkulele(): ChordLib {
    return ChordLib.for(InstrumentType.Ukulele);
  }

  /** Creates a new chord lib for a guitar. */
  static forGuitar(): ChordLib {
    return ChordLib.for(InstrumentType.Guitar);
  }

  /** Creates a new chord lib for an instrument. */
  static for(instrument: InstrumentType, tuning?: PitchedNote[]): ChordLib {
    let chords = new Map();
    if (instrument === InstrumentType.CustomStrings) {
      assert(tuning, "Custom string instrument requires a tuning");
    } else {
      assert(
        !tuning || compatibleWithDefaultTuning(instrument, tuning),
        `Instrument "${instrument}" is not compatible with tuning ` +
          tuning?.map((s) => s.toString()).join(", ")
      );
    }
    switch (instrument) {
      case InstrumentType.Ukulele:
      case InstrumentType.UkuleleLowG:
        chords = UKULELE_CHORD_FRETS;
        break;
      case InstrumentType.Guitar:
        chords = GUITAR_CHORD_FRETS;
    }
    return new ChordLib(chords, tuning ?? getTuning(instrument));
  }

  /**
   * Returns the frets for the requested chord if available in the library.
   * If a flat or sharp chord is unknown, returns the corresponding sharp or
   * flat chord if available.
   */
  getFrets(chord: ChordInput | null): number[] | null {
    if (!chord) return null;
    chord = toChord(chord);
    const chordName = chord.toString();
    let altChordName = "";
    const altRoot = NOTE_IDENTITY.get(chord.root);
    if (altRoot)
      altChordName = new Chord(
        altRoot,
        chord.qualifier,
        chord.extension
      ).toString();

    const frets =
      fretsFromMap(this.costumChords, chordName, altChordName) ??
      fretsFromMap(this.instrumentChords, chordName, altChordName);
    if (frets) return frets;

    // Attempt to generate the chord. We only care not to play wrong notes, for
    // now there is no attempt to make the chord complete.
    // TODO: Ensure all notes are present and frets are not too far apart.
    const chordNotes = chord.asPitchedNotes(PitchedNote.C4);
    return this.tuning.map((s) => {
      // We make sure the string note is lower than the chord notes.
      const stringNote = PitchedNote.fromNote(s.note, 3);
      let minFret = 12;
      for (const chordNote of chordNotes) {
        const fret = chordNote.compare(stringNote) % 12;
        if (fret < minFret) minFret = fret;
      }
      return minFret;
    });
  }

  /** Same as getFrets but converts the fret numbers to strings. */
  getStringFrets(chord: ChordInput | null): string[] | null {
    return this.getFrets(chord)?.map((f) => (f < 0 ? "X" : `${f}`)) ?? null;
  }

  /**
   * Returns the notes of the chord, given the strings of the instrument. If a
   * string is muted, null is returned in its place. If the chord is unknown,
   * returns null.
   */
  getPitchedNotes(chord: ChordInput | null): Array<PitchedNote | null> | null {
    const frets = this.getFrets(chord);
    if (!frets) return null;
    return this.toPitchedNotes(frets);
  }

  /**
   * Returns the bass string - i.e., the lowest string playing the root note.
   */
  getRootString(chord: ChordInput | null): number | null {
    if (!chord) return null;
    const root = toChord(chord).rootNote().note;
    const notes = this.getPitchedNotes(chord) ?? [];
    let lowest = PitchedNote.MAX_NOTE;
    let string = null;
    for (let i = 0; i < notes.length; i++) {
      const note = notes[i];
      if (note?.note === root && note.compare(lowest) < 0) {
        lowest = note;
        string = i + 1;
      }
    }
    return string;
  }

  /** If `string` is 0, returns the root string. Otherwise, returns `string`. */
  replaceRootString(string: number, chord: ChordInput | null): number {
    if (string > 0) return string;
    return this.getRootString(chord) ?? 1;
  }

  /** Returns true if this custom chord has been defined. */
  hasCustomChord(chord: ChordInput): boolean {
    return !!this.costumChords.get(toString(chord));
  }

  /** Defines a custom chord which overwrites an existing chord. */
  defineChord(chord: ChordInput, frets: number[]): void {
    assert(
      this.isCompatibleChord(chord, frets),
      `Got invalid frets (${frets.join(" ")}) for chord ${chord}; ` +
        `tuning: ${this.tuning.map((s) => s.toString()).join(" ")}`
    );
    this.costumChords.set(toString(chord), frets);
  }

  /**
   * Defines a custom chord if it is compatible and does not as custom chord.
   * Returns true if the chord was added.
   */
  defineChordIfCompatible(chord: ChordInput, frets: number[]): boolean {
    if (!this.isCompatibleChord(chord, frets) || this.hasCustomChord(chord)) {
      return false;
    }
    this.costumChords.set(toString(chord), frets);
    return true;
  }

  /**
   * Parses a chord from a token and then defines that chord. Returns true if
   * the chord was added (always return true if assertCompatible is set).
   */
  parseChord(token: Token, assertCompatible = true): boolean {
    try {
      const chord = Chord.parse(token.key);
      assert(
        token.type === TokenType.ChordDefinition && chord && token.value,
        "Failed to parse chord from token"
      );
      const frets = token.value
        .split(/\s+/)
        .map((f) => (f === "x" ? -1 : parseInt(f)));
      if (assertCompatible) {
        this.defineChord(chord, frets);
        return true;
      }
      return this.defineChordIfCompatible(chord, frets);
    } catch (e) {
      throw token.error(e.message);
    }
  }

  private toPitchedNotes(frets: number[]): Array<PitchedNote | null> {
    return frets.map((f, i) => (f < 0 ? null : this.tuning[i].addSemitones(f)));
  }

  /**
   * Returns true if the frets are a valid chord for this instrument. Verifies
   * no wrong notes are implied by the frets, but does not verify all notes are
   * present.
   */
  private isCompatibleChord(chord: ChordInput, frets: number[]): boolean {
    if (this.tuning.length !== frets.length) return false;
    const chordNotes = toChord(chord)
      .asPitchedNotes()
      .map((n) => toSharp(n.note));
    const fretNotes = this.toPitchedNotes(frets);
    for (const fretNote of fretNotes) {
      if (fretNote && !chordNotes.includes(toSharp(fretNote.note))) {
        return false;
      }
    }
    return true;
  }
}
