import { Chord } from "./chord";
import { NOTE_IDENTITY } from "./note";

const UKULELE_CHORD_FRETS = new Map<string, number[]>([
  ["C", [0, 0, 0, 3]],
  ["Cm", [0, 3, 3, 3]],
  ["C7", [0, 0, 0, 1]],
  ["D", [2, 2, 2, 0]],
  ["Dm", [2, 2, 1, 0]],
  ["D7", [2, 2, 2, 3]],
  ["E", [4, 4, 4, -1]],
  ["Em", [2, 3, 4, 0]],
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
  ["B7", [2, 1, 2, 2]],
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
  return fretMap.get(chord) ?? fretMap.get(altChord) ?? null;
}

/** Maps chords to frets, with the option to add custom chords. */
export class ChordLib {
  private costumChords = new Map<string, number[]>();

  private constructor(private instrumentChords: Map<string, number[]>) {}

  /** Creates a new chord lib for a ukulele. */
  static forUkulele(): ChordLib {
    return new ChordLib(UKULELE_CHORD_FRETS);
  }

  /**
   * Returns the frets for the requested chord if available in the library.
   * If a flat or sharp chord is unknown, returns the corresponding sharp or
   * flat chord if available.
   */
  getFrets(chord?: Chord): number[] | null {
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

    return (
      fretsFromMap(this.costumChords, chordName, altChordName) ??
      fretsFromMap(this.instrumentChords, chordName, altChordName)
    );
    // TODO: Attempt to generate a chord.
  }

  /** Same as getFrets but converts the fret numbers to strings. */
  getStringFrets(chord?: Chord): string[] | null {
    return this.getFrets(chord)?.map((f) => (f < 0 ? "X" : `${f}`));
  }

  /** Defines a chord which might overwrite the default chord. */
  defineChord(chord: Chord, frets: number[]): void {
    this.costumChords.set(chord.toString(), frets);
  }
}
