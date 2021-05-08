import { Chord } from "./chord";
import { NOTE_IDENTITY, Note, PitchedNote } from "./note";
import { Token, TokenType } from "./token";

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
  private costumChords = new Map<string, number[]>();

  private constructor(
    private instrumentChords: Map<string, number[]>,
    private strings: Note[]
  ) {}

  /** Creates a new chord lib for a ukulele. */
  static forUkulele(): ChordLib {
    return new ChordLib(UKULELE_CHORD_FRETS, [Note.G, Note.C, Note.E, Note.A]);
  }

  /**
   * Returns the frets for the requested chord if available in the library.
   * If a flat or sharp chord is unknown, returns the corresponding sharp or
   * flat chord if available.
   */
  getFrets(chord: Chord | null): number[] | null {
    if (!chord) return null;
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
    return this.strings.map((string) => {
      // We make sure the string note is lower than the chord notes.
      const stringNote = PitchedNote.fromNote(string, 3);
      let minFret = 12;
      for (const chordNote of chordNotes) {
        const fret = chordNote.compare(stringNote) % 12;
        if (fret < minFret) minFret = fret;
      }
      return minFret;
    });
  }

  /** Same as getFrets but converts the fret numbers to strings. */
  getStringFrets(chord: Chord | null): string[] | null {
    return this.getFrets(chord)?.map((f) => (f < 0 ? "X" : `${f}`)) ?? null;
  }

  /**
   * Returns the notes of the chord, given the strings of the instrument. If a
   * string is muted, null is returned in its place. If the chord is unknown,
   * returns null.
   */
  getPitchedNotes(
    chord: Chord | null,
    strings: Array<PitchedNote>
  ): Array<PitchedNote | null> | null {
    const frets = this.getFrets(chord);
    if (!frets) return null;
    if (frets.length !== strings.length) {
      throw new Error(
        `Failed to determine chord notes, got ${strings.length} strings but ` +
          `expected ${frets.length}.`
      );
    }
    const notes = [];
    for (let i = 0; i < frets.length; i++) {
      if (frets[i] < 0) {
        notes.push(null);
      } else {
        notes.push(strings[i].addSemitones(frets[i]));
      }
    }
    return notes;
  }

  /** Defines a chord which might overwrite the default chord. */
  defineChord(chord: Chord, frets: number[]): void {
    this.costumChords.set(chord.toString(), frets);
  }

  /** Parses a chord from a token and then defines that chord. */
  parseChord(token: Token) {
    if (
      token.type !== TokenType.ChordDefinition ||
      !token.key ||
      !token.value
    ) {
      throw new Error("Failed to parse chord from token");
    }
    const frets = token.value.split(/\s+/);
    if (frets.length !== this.strings.length) {
      throw new Error(
        `Wrong number of frets in defined chord: expected ` +
          `${this.strings.length}, got ${frets.length}`
      );
    }
    this.costumChords.set(
      token.key,
      frets.map((fret) => (fret === "x" ? -1 : parseInt(fret)))
    );
  }
}
