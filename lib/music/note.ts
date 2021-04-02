export enum Note {
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

export function renderNote(note: Note | string): string {
  return note.replace("#", "♯").replace("b", "♭");
}

export enum Scale {
  Major = "",
  Minor = "m",
}

export const BEAT_LENGTHS = new Map<string, number>([
  [".", 1], // quarter note in 4/4
  [",", 1 / 2], // eigth note in 4/4
  [":", 1 / 4], // sixteenth note in 4/4
  [";", 1 / 8], // thirty-second note in 4/4
  ["'", 2 / 3], // quarter triplet in 4/4
  ['"', 1 / 3], // eigth triplet in 4/4
]);

const BEAT_GCC = 3 * 8;

export const BEAT_LENGTHS_RE = `[_.,:;'"]*`;

export function parseBeats(value: string, beatsInBar = 4) {
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

export function sumBeats(beats: number[]) {
  const sum = beats.reduce((a, b) => a + b, 0);
  return Math.round(sum * BEAT_GCC) / BEAT_GCC;
}
