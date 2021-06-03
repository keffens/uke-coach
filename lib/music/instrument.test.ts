import { ChordLib } from "./chord_lib";
import { Instrument } from "./instrument";
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
    InstrumentType.CustomStrings,
    SoundType.Electric,
    tuning
  );
  expect(uke.chordLib).toEqual(
    ChordLib.for(InstrumentType.CustomStrings, tuning)
  );
  expect(uke.sound).toEqual(SoundType.Electric);
  expect(uke.name).toEqual("cigar-box");
  expect(uke.tuning).toEqual(tuning);
});

test("prases instruments", () => {
  expect(Instrument.parse("rythm (uke) ukulele")).toEqual(
    new Instrument("rythm (uke)", InstrumentType.Ukulele)
  );
  expect(Instrument.parse("rythm ukulele (low G-string)")).toEqual(
    new Instrument("rythm", InstrumentType.UkuleleLowG)
  );
  expect(Instrument.parse("lead guitar guitar electric")).toEqual(
    new Instrument("lead guitar", InstrumentType.Guitar, SoundType.Electric)
  );
  expect(Instrument.parse("bass ukulele tuning G2 C2 E2 A2 bass")).toEqual(
    new Instrument(
      "bass",
      InstrumentType.Ukulele,
      SoundType.Bass,
      ["G2", "C2", "E2", "A2"].map((s) => PitchedNote.parse(s))
    )
  );
  expect(
    Instrument.parse("cigar-box custom-strings tuning D3 G3 B3 E4")
  ).toEqual(
    new Instrument(
      "cigar-box",
      InstrumentType.CustomStrings,
      SoundType.Nylon,
      ["D3", "G3", "B3", "E4"].map((s) => PitchedNote.parse(s))
    )
  );
});
