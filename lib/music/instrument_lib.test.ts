import { Instrument } from "./instrument";
import { InstrumentLib } from "./instrument_lib";
import { InstrumentType } from "./instrument_type";

test("adds and gets instruments", () => {
  const lib = new InstrumentLib();
  lib.addInstrument(new Instrument("guitar", InstrumentType.Ukulele));
  lib.addInstrument(new Instrument("uke", InstrumentType.Guitar));

  expect(lib.getInstrument("guitar")).toBeTruthy();
  expect(lib.getInstrument("uke")).toBeTruthy();
  expect(lib.getDefault()).toBe(lib.getInstrument("guitar"));

  expect([...lib.instruments].map((i) => i.name).sort()).toEqual([
    "guitar",
    "uke",
  ]);

  expect(() => lib.getInstrument("cigar-box")).toThrow();
});

test("creates default instrument if it doesn't exist", () => {
  const lib = new InstrumentLib();
  expect(() => lib.getInstrument("ukulele")).toThrow();

  expect(lib.getDefault()).toBe(lib.getInstrument("ukulele"));
});
