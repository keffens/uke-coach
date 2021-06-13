import { Instrument } from "./instrument";
import { InstrumentLib } from "./instrument_lib";
import { InstrumentType } from "./instrument_type";
import { TimeSignature } from "./signature";
import { Token, TokenType } from "./token";

test("adds and gets instruments", () => {
  const lib = new InstrumentLib();
  lib.addInstrument(new Instrument("guitar", InstrumentType.Guitar));
  lib.addInstrument(new Instrument("uke", InstrumentType.Ukulele));

  expect(lib.getInstrument("guitar")).toBeTruthy();
  expect(lib.getInstrument("uke")).toBeTruthy();
  expect(lib.getDefault()).toBe(lib.getInstrument("guitar"));
  expect(lib.getInstrument()).toBe(lib.getInstrument("guitar"));

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

test("parses chords", () => {
  const lib = new InstrumentLib();
  const time = TimeSignature.DEFAULT;
  lib.addInstrument(new Instrument("u1", InstrumentType.Ukulele));
  lib.addInstrument(new Instrument("u2", InstrumentType.UkuleleLowG));
  lib.addInstrument(new Instrument("g", InstrumentType.Guitar));

  lib.parseToken(
    new Token(TokenType.ChordDefinition, "E", "0 2 2 1 0 0"),
    time,
    lib.getInstrument("g")
  );
  lib.parseToken(
    new Token(TokenType.ChordDefinition, "E", "4 4 4 -1"),
    time,
    lib.getInstrument("u1")
  );
  lib.parseToken(new Token(TokenType.ChordDefinition, "G", "0 2 3 2"), time);
  lib.parseToken(
    new Token(TokenType.ChordDefinition, "G", "3 2 0 0 0 3"),
    time
  );
  lib.parseToken(new Token(TokenType.ChordDefinition, "C", "0 0 0 3"), time);

  expect(lib.getInstrument("g").chordLib.hasCustomChord("E")).toEqual(true);
  expect(lib.getInstrument("g").chordLib.hasCustomChord("G")).toEqual(true);
  expect(lib.getInstrument("g").chordLib.hasCustomChord("C")).toEqual(false);

  expect(lib.getInstrument("u1").chordLib.hasCustomChord("E")).toEqual(true);
  expect(lib.getInstrument("u1").chordLib.hasCustomChord("G")).toEqual(true);
  expect(lib.getInstrument("u1").chordLib.hasCustomChord("C")).toEqual(true);

  expect(lib.getInstrument("u2").chordLib.hasCustomChord("E")).toEqual(false);
  expect(lib.getInstrument("u2").chordLib.hasCustomChord("G")).toEqual(true);
  expect(lib.getInstrument("u2").chordLib.hasCustomChord("C")).toEqual(true);
});

test("parses patterns", () => {
  const lib = new InstrumentLib();
  const time = TimeSignature.DEFAULT;
  lib.addInstrument(new Instrument("u", InstrumentType.Ukulele));
  lib.addInstrument(new Instrument("g", InstrumentType.Guitar));

  lib.parseToken(
    new Token(TokenType.Pattern, "island", "|d-du-udu|"),
    time,
    lib.getInstrument("u")
  );
  lib.parseToken(new Token(TokenType.Pattern, "island", "|D-duxudu|"), time);
  lib.parseToken(new Token(TokenType.Pattern, "plugged", "|12345654|"), time);
  expect(lib.activePatterns.map((p) => p.toString())).toEqual([
    "|d-du-udu|",
    "|12345654|",
  ]);

  lib.parseToken(new Token(TokenType.Pattern, "island"), time);
  expect(lib.activePatterns.map((p) => p.toString())).toEqual([
    "|d-du-udu|",
    "|D-duxudu|",
  ]);

  lib.parseToken(new Token(TokenType.Pattern, "plugged"), time);
  expect(lib.activePatterns.map((p) => p.toString())).toEqual([
    "|d-du-udu|",
    "|12345654|",
  ]);

  expect(() =>
    lib.parseToken(
      new Token(TokenType.Pattern, "plugged"),
      time,
      lib.getInstrument("u")
    )
  ).toThrow();
});

test("parses instrument environment", () => {
  const lib = new InstrumentLib();
  const time = TimeSignature.DEFAULT;
  lib.addInstrument(new Instrument("u", InstrumentType.Ukulele));
  lib.addInstrument(new Instrument("g", InstrumentType.Guitar));
  lib.parseToken(new Token(TokenType.Pattern, "island", "|d-du-udu|"), time);

  lib.parseToken(
    new Token(TokenType.StartEnv, "instrument", "g", [
      new Token(TokenType.Pattern, "island", "|D-duxudu|"),
      new Token(TokenType.ChordDefinition, "E", "0 2 2 1 0 0"),
    ]),
    time
  );

  expect(lib.activePatterns.map((p) => p.toString())).toEqual([
    "|d-du-udu|",
    "|D-duxudu|",
  ]);
  expect(lib.getInstrument("g").chordLib.hasCustomChord("E")).toEqual(true);
});

test("parses an instrument", () => {
  const lib = new InstrumentLib();
  const time = TimeSignature.DEFAULT;
  lib.parseToken(
    new Token(TokenType.Instrument, undefined, "rythm guitar"),
    time
  );
  expect(lib.getDefault()).toEqual(
    new Instrument("rythm", InstrumentType.Guitar)
  );
});
