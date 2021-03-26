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

export const BEAT_DIVIDER = new Map<string, number>([
  ["_", 1], // half note in 4/4
  [".", 1], // quarter note in 4/4
  [",", 2], // eigth note in 4/4
  [":", 4], // sixteenth note in 4/4
  [";", 8], // thirty-second note in 4/4
  ["'", 1.5], // quarter triplet in 4/4
  ['"', 3], // eigth triplet in 4/4
]);

export const BEAT_DIVIDER_RE = `[_.,:;'"]*`;
