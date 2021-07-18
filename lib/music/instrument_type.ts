import { assert } from "../util";
import { PitchedNote, toFlat } from "./note";

/** The different implemented instrument types. */
export enum InstrumentType {
  Ukulele = "ukulele",
  UkuleleLowG = "ukulele (low G-string)",
  Guitar = "guitar",
  Bass = "bass",
  CustomStrings = "custom-strings",
}

const TUNING = new Map<InstrumentType, PitchedNote[]>([
  [
    InstrumentType.Ukulele,
    ["G4", "C4", "E4", "A4"].map((s) => PitchedNote.parse(s)),
  ],
  [
    InstrumentType.UkuleleLowG,
    ["G3", "C4", "E4", "A4"].map((s) => PitchedNote.parse(s)),
  ],
  [
    InstrumentType.Guitar,
    ["E2", "A2", "D3", "G3", "B3", "E4"].map((s) => PitchedNote.parse(s)),
  ],
  [
    InstrumentType.Bass,
    ["E1", "A1", "D2", "G2"].map((s) => PitchedNote.parse(s)),
  ],
]);

/**
 * Returns the tuning for the instrument. Throws an error for the custom type.
 */
export function getTuning(instrument: InstrumentType): PitchedNote[] {
  const tuning = TUNING.get(instrument);
  assert(tuning?.length, `No default tuning for instrument "${instrument}"`);
  return tuning;
}

/**
 * Returns whether the tuning is equal to the default tuning except for octave
 * switches.
 */
export function compatibleWithDefaultTuning(
  instrument: InstrumentType,
  tuning: PitchedNote[]
): boolean {
  const defaultTuning = getTuning(instrument);
  if (defaultTuning.length !== tuning.length) return false;
  for (let i = 0; i < tuning.length; i++) {
    if (toFlat(defaultTuning[i].note) !== toFlat(tuning[i].note)) return false;
  }
  return true;
}

/** Sound selection for instruments. */
export enum SoundType {
  Nylon = "nylon",
  Steel = "steel",
  Electric = "electric",
  Bass = "bass",
}

/** Returns the default sound for this instrument. */
export function getDefaultSound(instrument: InstrumentType): SoundType {
  if (instrument === InstrumentType.Bass) {
    return SoundType.Bass;
  }
  // Default for guitar and ukulele.
  return SoundType.Nylon;
}
