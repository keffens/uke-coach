import { ChordLib } from "./chord_lib";
import { Instrument } from "./instrument";
import { InstrumentLib } from "./instrument_lib";
import { InstrumentType, SoundType, getTuning } from "./instrument_type";
import { PitchedNote } from "./note";
import { Pattern } from "./pattern";
import { TimeSignature } from "./signature";
import { Token, TokenType } from "./token";

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
  expect(Instrument.parse("bass [ukulele] tuning G2 C2 E2 A2 bass")).toEqual(
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

test("parses instrument from token and back to token", () => {
  let token = new Token(TokenType.Instrument, undefined, "uke ukulele");
  let instrument = Instrument.fromToken(token);
  expect(instrument).toEqual(new Instrument("uke", InstrumentType.Ukulele));
  expect(instrument.tokenize()).toEqual(token);

  token = new Token(TokenType.Instrument, undefined, "guitar guitar electric");
  instrument = Instrument.fromToken(token);
  expect(instrument).toEqual(
    new Instrument("guitar", InstrumentType.Guitar, SoundType.Electric)
  );
  expect(instrument.tokenize()).toEqual(token);

  token = new Token(
    TokenType.Instrument,
    undefined,
    "tiny uke ukulele tuning G5 C5 E5 A5"
  );
  instrument = Instrument.fromToken(token);
  expect(instrument).toEqual(
    new Instrument(
      "tiny uke",
      InstrumentType.Ukulele,
      undefined,
      ["G5", "C5", "E5", "A5"].map((s) => PitchedNote.parse(s))
    )
  );
  expect(instrument.tokenize()).toEqual(token);
});

test("adds patterns and select active pattern", () => {
  const uke = new Instrument("uke", InstrumentType.Ukulele);
  const island = Pattern.parse("|d-du-udu|", TimeSignature.DEFAULT, "island");
  const noname = Pattern.parse("|dudu|", TimeSignature.DEFAULT, "");

  expect(uke.activePattern).toBeNull();
  expect(() => uke.setActivePattern("island")).toThrow();

  uke.setPattern(island);
  expect(uke.activePattern).toBe(island);

  uke.setPattern(noname);
  expect(uke.activePattern).toBe(noname);

  uke.setActivePattern("island");
  expect(uke.activePattern).toBe(island);

  expect(() => uke.setActivePattern("")).toThrow();
});

test("selects active pattern if defined", () => {
  const uke = new Instrument("uke", InstrumentType.Ukulele);
  const island = Pattern.parse("|d-du-udu|", TimeSignature.DEFAULT, "island");
  const noname = Pattern.parse("|dudu|", TimeSignature.DEFAULT, "");

  expect(uke.setActivePatternIfDefined("island")).toEqual(false);
  expect(uke.activePattern).toBeNull();

  uke.setPattern(island);
  uke.setPattern(noname);
  expect(uke.activePattern).toBe(noname);

  expect(uke.setActivePatternIfDefined("island")).toEqual(true);
  expect(uke.activePattern).toBe(island);
});

test("fails to add incompatible patterns", () => {
  const uke = new Instrument("uke", InstrumentType.Ukulele);
  expect(() =>
    uke.setPattern(Pattern.parse("|2345|", TimeSignature.DEFAULT, "foo"))
  ).toThrow();

  expect(() =>
    uke.setPattern(
      Pattern.parseTab(["----", "1-1-"], TimeSignature.DEFAULT, "bar")
    )
  ).toThrow();
});

test("adds fallback pattern if possible", () => {
  const uke = new Instrument("uke", InstrumentType.Ukulele);
  const island = Pattern.parse("|d-du-udu|", TimeSignature.DEFAULT, "island");
  const island2 = Pattern.parse("|dudu|", TimeSignature.DEFAULT, "island");

  expect(uke.setPatternIfCompatible(island)).toEqual(true);
  expect(uke.activePattern).toBe(island);

  expect(
    uke.setPatternIfCompatible(
      Pattern.parse("|2345|", TimeSignature.DEFAULT, "foo")
    )
  ).toEqual(false);

  expect(uke.setPatternIfCompatible(island2)).toEqual(false);
  expect(uke.activePattern).toBe(island);
});

test("filters patterns", () => {
  const uke = new Instrument("uke", InstrumentType.Ukulele);
  const island = Pattern.parse("|d-du-udu|", TimeSignature.DEFAULT, "island");
  const dudu = Pattern.parse("|dudu|", TimeSignature.DEFAULT, "dudu");
  const other_dudu = Pattern.parse("|DUDU|", TimeSignature.DEFAULT, "dudu");
  uke.setPattern(island);
  uke.setPattern(dudu);
  expect(uke.getPatterns()).toEqual([island, dudu]);

  uke.filterPatterns(new Set([island, other_dudu]));
  expect(uke.getPatterns()).toEqual([island]);

  uke.filterPatterns(new Set());
  expect(uke.getPatterns()).toEqual([]);
});

test("checks for tabs in the patterns", () => {
  const uke = new Instrument("uke", InstrumentType.Ukulele);
  const plugged = Pattern.parse("|1234|", TimeSignature.DEFAULT, "plugged");
  const tab = Pattern.parseTab(
    ["1---", "-2--", "--4-", "----"],
    TimeSignature.DEFAULT,
    "bar"
  );

  expect(uke.hasTabs()).toBe(false);
  uke.setPattern(plugged);
  expect(uke.hasTabs()).toBe(false);
  uke.setPattern(tab);
  expect(uke.hasTabs()).toBe(true);
});

test("converts an instrument", () => {
  const uke = new Instrument("uke", InstrumentType.Ukulele);
  const guitar = new Instrument("guitar", InstrumentType.Guitar);
  const plugged = Pattern.parse("|1234|", TimeSignature.DEFAULT, "plugged");
  const tab = Pattern.parseTab(
    ["1---", "-2--", "--4-", "----"],
    TimeSignature.DEFAULT,
    "bar"
  );

  uke.setPattern(plugged);
  uke.setPattern(tab); // Tabs are not converted.
  guitar.setPattern(plugged);

  expect(uke.convertTo("guitar", InstrumentType.Guitar)).toEqual(guitar);
});
