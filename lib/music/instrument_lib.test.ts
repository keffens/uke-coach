import { Instrument } from "./instrument";
import { InstrumentLib } from "./instrument_lib";
import { InstrumentType } from "./instrument_type";
import { Pattern } from "./pattern";
import { TimeSignature } from "./signature";
import { Token, TokenType } from "./token";

test("adds and gets instruments", () => {
  const lib = new InstrumentLib();
  lib.addInstrument(new Instrument("guitar", InstrumentType.Guitar));
  lib.addInstrument(new Instrument("uke", InstrumentType.Ukulele));

  expect(lib.getInstrument("guitar")).toBe(lib.instruments[0]);
  expect(lib.getInstrument("uke")).toBe(lib.instruments[1]);
  expect(lib.getInstrument("foo")).toBeNull();
  expect(lib.getDefault()).toBe(lib.instruments[0]);

  expect([...lib.instruments].map((i) => i.name).sort()).toEqual([
    "guitar",
    "uke",
  ]);

  expect(lib.getInstrument("cigar-box")).toBeNull();
});

test("creates default instrument if it doesn't exist", () => {
  const lib = new InstrumentLib();
  expect(lib.getInstrument("ukulele")).toBeNull();

  expect(lib.getDefault()).toBe(lib.getInstrument("ukulele"));
});

test("parses chords", () => {
  const lib = new InstrumentLib();
  const time = TimeSignature.DEFAULT;
  const uke1 = new Instrument("uke1", InstrumentType.Ukulele);
  const uke2 = new Instrument("uke2", InstrumentType.UkuleleLowG);
  const guit = new Instrument("guit", InstrumentType.Guitar);
  lib.addInstrument(uke1);
  lib.addInstrument(uke2);
  lib.addInstrument(guit);

  lib.parseToken(
    new Token(TokenType.ChordDefinition, "E", "0 2 2 1 0 0"),
    time,
    guit
  );
  lib.parseToken(
    new Token(TokenType.ChordDefinition, "E", "4 4 4 -1"),
    time,
    uke1
  );
  lib.parseToken(new Token(TokenType.ChordDefinition, "G", "0 2 3 2"), time);
  lib.parseToken(
    new Token(TokenType.ChordDefinition, "G", "3 2 0 0 0 3"),
    time
  );
  lib.parseToken(new Token(TokenType.ChordDefinition, "C", "0 0 0 3"), time);

  expect(guit.chordLib.hasCustomChord("E")).toEqual(true);
  expect(guit.chordLib.hasCustomChord("G")).toEqual(true);
  expect(guit.chordLib.hasCustomChord("C")).toEqual(false);

  expect(uke1.chordLib.hasCustomChord("E")).toEqual(true);
  expect(uke1.chordLib.hasCustomChord("G")).toEqual(true);
  expect(uke1.chordLib.hasCustomChord("C")).toEqual(true);

  expect(uke2.chordLib.hasCustomChord("E")).toEqual(false);
  expect(uke2.chordLib.hasCustomChord("G")).toEqual(true);
  expect(uke2.chordLib.hasCustomChord("C")).toEqual(true);
});

test("parses patterns", () => {
  const lib = new InstrumentLib();
  const time = TimeSignature.DEFAULT;
  const uke = new Instrument("uke", InstrumentType.Ukulele);
  const guit = new Instrument("guit", InstrumentType.Guitar);
  lib.addInstrument(uke);
  lib.addInstrument(guit);

  lib.parseToken(
    new Token(TokenType.Pattern, "island", "|d-du-udu|"),
    time,
    uke
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
    lib.parseToken(new Token(TokenType.Pattern, "plugged"), time, uke)
  ).toThrow();
});

test("parses instrument environment", () => {
  const lib = new InstrumentLib();
  const time = TimeSignature.DEFAULT;
  const uke = new Instrument("uke", InstrumentType.Ukulele);
  const guit = new Instrument("guit", InstrumentType.Guitar);
  lib.addInstrument(uke);
  lib.addInstrument(guit);
  lib.parseToken(new Token(TokenType.Pattern, "island", "|d-du-udu|"), time);

  lib.parseToken(
    new Token(TokenType.InstrumentEnv, "instrument", "guit", [
      new Token(TokenType.Pattern, "island", "|D-duxudu|"),
      new Token(TokenType.ChordDefinition, "E", "0 2 2 1 0 0"),
    ]),
    time
  );

  expect(lib.activePatterns.map((p) => p.toString())).toEqual([
    "|d-du-udu|",
    "|D-duxudu|",
  ]);
  expect(guit.chordLib.hasCustomChord("E")).toEqual(true);
});

test("parses an instrument", () => {
  const lib = new InstrumentLib();
  const time = TimeSignature.DEFAULT;

  lib.parseToken(
    new Token(TokenType.Instrument, undefined, "rythm guitar"),
    time
  );

  expect(lib.getDefault().name).toEqual("rythm");
  expect(lib.activePatterns).toEqual([Pattern.makeEmpty(time)]);
});

test("parses instrument and converts back to string", () => {
  const tokens = [
    new Token(
      TokenType.Instrument,
      undefined,
      "uke ukulele tuning G5 C5 E5 A5 electric"
    ),
    new Token(TokenType.ChordDefinition, "C", "5 4 3 3"),
    new Token(TokenType.Pattern, "plugged", "|1234----|"),
    new Token(TokenType.Pattern, "*hidden", "|12341234|"),
    new Token(TokenType.Paragraph),
  ];

  const lib = new InstrumentLib();
  const time = TimeSignature.DEFAULT;
  for (const token of tokens) {
    lib.parseToken(token, time);
  }

  expect(lib.tokenize()).toEqual(tokens);
});

test("parses 2 instruments and converts back to string as", () => {
  const tokens = [
    new Token(TokenType.Instrument, undefined, "uke ukulele"),
    new Token(TokenType.InstrumentEnv, "instrument", "uke", [
      new Token(TokenType.Pattern, "plugged", "|1234|"),
    ]),
    new Token(TokenType.Paragraph),
    new Token(TokenType.Instrument, undefined, "guitar guitar"),
    new Token(TokenType.InstrumentEnv, "instrument", "guitar", [
      new Token(TokenType.ChordDefinition, "E", "0 2 2 1 0 0"),
      new Token(TokenType.Pattern, "plugged", "|1234|"),
    ]),
    new Token(TokenType.Paragraph),
  ];

  const lib = new InstrumentLib();
  const time = TimeSignature.DEFAULT;
  for (const token of tokens) {
    lib.parseToken(token, time);
  }

  expect(lib.tokenize()).toEqual(tokens);
});
