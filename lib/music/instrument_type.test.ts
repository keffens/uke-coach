import {
  InstrumentType,
  getTuning,
  compatibleWithDefaultTuning,
} from "./instrument_type";
import { PitchedNote } from "./note";

test("non-custom instruments have a tuning", () => {
  for (const instrument of Object.values(InstrumentType)) {
    if (instrument !== InstrumentType.CustomStrings) {
      expect(getTuning(instrument).length).toBeGreaterThan(0);
    }
  }
});

test("compares to default tunings", () => {
  expect(
    compatibleWithDefaultTuning(
      InstrumentType.Ukulele,
      getTuning(InstrumentType.UkuleleLowG)
    )
  ).toEqual(true);
  expect(
    compatibleWithDefaultTuning(
      InstrumentType.Ukulele,
      ["G4", "C5", "E2", "A7"].map((s) => PitchedNote.parse(s))
    )
  ).toEqual(true);
  expect(
    compatibleWithDefaultTuning(
      InstrumentType.Guitar,
      ["E4", "A4", "D4", "G4", "B4", "E4"].map((s) => PitchedNote.parse(s))
    )
  ).toEqual(true);
  expect(
    compatibleWithDefaultTuning(
      InstrumentType.Ukulele,
      ["G4", "C4", "D4", "A4"].map((s) => PitchedNote.parse(s))
    )
  ).toEqual(false);
  expect(
    compatibleWithDefaultTuning(
      InstrumentType.Ukulele,
      ["G4", "C4", "E4"].map((s) => PitchedNote.parse(s))
    )
  ).toEqual(false);
  expect(
    compatibleWithDefaultTuning(
      InstrumentType.Ukulele,
      ["G4", "C4", "E4", "A4", "A4"].map((s) => PitchedNote.parse(s))
    )
  ).toEqual(false);
});
