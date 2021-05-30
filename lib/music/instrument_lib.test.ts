import { InstrumentLib } from "./instrument_lib";
import { InstrumentType } from "./instrument_type";

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
