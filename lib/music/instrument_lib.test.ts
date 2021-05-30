import { ChordLib } from "./chord_lib";
import { Instrument, InstrumentLib } from "./instrument_lib";
import { InstrumentType, SoundType, getTuning } from "./instrument_type";
import { PitchedNote } from "./note";

test("creates default instrument", () => {
  const uke = new Instrument("uke", InstrumentType.Ukulele);
  expect(uke.chordLib).toEqual(ChordLib.forUkulele());
  expect(uke.sound).toEqual(SoundType.Nylon);
  expect(uke.name).toEqual("uke");
  expect(uke.tuning).toEqual(getTuning(InstrumentType.Ukulele));
});

test("creates custom instrument", () => {
  const tuning = ["D3", "G3", "B3", "E4"].map((s) => PitchedNote.parse(s));
  const uke = new Instrument(
    "cigar-box",
    InstrumentType.Custom,
    SoundType.Electric,
    tuning
  );
  expect(uke.chordLib).toEqual(ChordLib.for(InstrumentType.Custom, tuning));
  expect(uke.sound).toEqual(SoundType.Electric);
  expect(uke.name).toEqual("cigar-box");
  expect(uke.tuning).toEqual(tuning);
});

test("adds and gets instruments", () => {
  const lib = new InstrumentLib();
  lib.addInstrument("guitar", InstrumentType.Ukulele);
  lib.addInstrument("uke", InstrumentType.Guitar);
  lib.addDefaultIfEmpty();

  expect(lib.getInstrument("guitar")).toBeTruthy();
  expect(lib.getInstrument("uke")).toBeTruthy();
  expect(lib.getDefault()).toBe(lib.getInstrument("guitar"));

  expect(() => lib.getInstrument("cigar-box")).toThrow();
});

test("creates default instrument", () => {
  const lib = new InstrumentLib();
  expect(() => lib.getDefault()).toThrow();

  lib.addDefaultIfEmpty();
  expect(lib.getDefault()).toBeTruthy();
});
