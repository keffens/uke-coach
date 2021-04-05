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

/** Renders a note for display on the web using unicode ♯ and ♭. */
export function renderNote(note: Note | string): string {
  return note.replace("#", "♯").replace("b", "♭");
}

/** Scale of the key, currently restircted to major and minor. */
export enum Scale {
  Major = "",
  Minor = "m",
}

const BEAT_LENGTHS = new Map<string, number>([
  [".", 1], // quarter note in 4/4
  [",", 1 / 2], // eigth note in 4/4
  [":", 1 / 4], // sixteenth note in 4/4
  [";", 1 / 8], // thirty-second note in 4/4
  ["'", 2 / 3], // quarter triplet in 4/4
  ['"', 1 / 3], // eigth triplet in 4/4
]);

const BEAT_GCC = 3 * 8;

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
  return Math.round(sum * BEAT_GCC) / BEAT_GCC;
}
