import { Chord } from "./chord";
import { ChordLib } from "./chord_lib";
import { InstrumentType } from "./instrument_type";
import { Note, PitchedNote, toSharp } from "./note";
import { Token, TokenType } from "./token";

test("gets default chords frets", () => {
  const chordLib = ChordLib.forUkulele();
  expect(chordLib.getFrets("C")).toEqual([0, 0, 0, 3]);
  expect(chordLib.getFrets("C#")).toEqual([1, 1, 1, 4]);
  expect(chordLib.getFrets("Db")).toEqual([1, 1, 1, 4]);
  expect(chordLib.getFrets("E")).toEqual([4, 4, 4, -1]);
  expect(chordLib.getFrets(null)).toBeNull();
});

test("gets generated chord frets", () => {
  const chordLib = ChordLib.forUkulele();
  expect(chordLib.getFrets("Cmaj7")).toEqual([0, 0, 0, 2]);
  expect(chordLib.getFrets("Caug")).toEqual([1, 0, 0, 3]);
  expect(chordLib.getFrets("Gdim")).toEqual([0, 1, 3, 1]);
});

test("gets default chords string frets", () => {
  const chordLib = ChordLib.forUkulele();
  expect(chordLib.getStringFrets("C")).toEqual(["0", "0", "0", "3"]);
  expect(chordLib.getStringFrets("E")).toEqual(["4", "4", "4", "X"]);
  expect(chordLib.getFrets(null)).toBeNull();
});

test("gets pitched notes", () => {
  const chordLib = ChordLib.forUkulele();
  expect(
    chordLib
      .getPitchedNotes("C")
      ?.map((note) => (note === null ? null : note.toString()))
  ).toEqual(["G4", "C4", "E4", "C5"]);
  expect(
    chordLib
      .getPitchedNotes("E")
      ?.map((note) => (note === null ? null : note.toString()))
  ).toEqual(["B4", "E4", "G#4", null]);
  expect(chordLib.getPitchedNotes(null)).toBeNull();
});

test("defines gets custom chords frets", () => {
  const chordLib = ChordLib.forUkulele();
  // Overwrite default chord.
  expect(chordLib.getFrets("C")).toEqual([0, 0, 0, 3]);
  expect(chordLib.hasCustomChord("C")).toEqual(false);
  chordLib.defineChord("C", [5, 4, 3, 3]);
  expect(chordLib.getFrets("C")).toEqual([5, 4, 3, 3]);
  expect(chordLib.hasCustomChord("C")).toEqual(true);

  // Overwrites generated chord.
  expect(chordLib.getFrets("Bm7")).toEqual([2, 2, 2, 0]);
  expect(chordLib.hasCustomChord("Bm7")).toEqual(false);
  chordLib.defineChord("Bm7", [2, 2, 2, 2]);
  expect(chordLib.getFrets("Bm7")).toEqual([2, 2, 2, 2]);
  expect(chordLib.hasCustomChord("Bm7")).toEqual(true);
});

test("fails to define invalid chord", () => {
  const chordLib = ChordLib.forUkulele();
  expect(() => chordLib.defineChord("Am", [2, 0, 0])).toThrow();
  expect(() => chordLib.defineChord("Am", [0, 0, 0, 0])).toThrow();
});

test("defines chords if valid and undefined", () => {
  const chordLib = ChordLib.forUkulele();
  // Invalid chords.
  expect(chordLib.defineChordIfCompatible("Am", [2, 0, 0])).toEqual(false);
  expect(chordLib.defineChordIfCompatible("Am", [0, 0, 0, 0])).toEqual(false);
  expect(chordLib.getFrets("Am")).toEqual([2, 0, 0, 0]);

  // Defines compatible chord.
  expect(chordLib.defineChordIfCompatible("Am", [14, 0, 0, 0])).toEqual(true);
  expect(chordLib.getFrets("Am")).toEqual([14, 0, 0, 0]);

  // Doesn't overwrite custom chord.
  chordLib.defineChord("C", [5, 4, 3, 3]);
  expect(chordLib.defineChordIfCompatible("C", [0, 0, 0, 3])).toEqual(false);
  expect(chordLib.getFrets("C")).toEqual([5, 4, 3, 3]);
});

test("parses custom chord frets", () => {
  const chordLib = ChordLib.forUkulele();
  expect(chordLib.getFrets("C")).toEqual([0, 0, 0, 3]);
  expect(chordLib.hasCustomChord("C")).toEqual(false);
  chordLib.parseChord(new Token(TokenType.ChordDefinition, "C", "5 4 3 3"));
  expect(chordLib.getFrets("C")).toEqual([5, 4, 3, 3]);
  expect(chordLib.hasCustomChord("C")).toEqual(true);

  chordLib.parseChord(new Token(TokenType.ChordDefinition, "C", "12 12 12 x"));
  expect(chordLib.getFrets("C")).toEqual([12, 12, 12, -1]);
});

function noteSet(notes: Array<PitchedNote | null> | null): Set<Note | null> {
  if (!notes) return new Set();
  return new Set(
    notes
      .filter((note) => note)
      .map((note) => (note ? toSharp(note.note) : null))
  );
}

test("verifies ukulele chord lib", () => {
  const chordLib = ChordLib.forUkulele();

  for (const note of Object.values(Note)) {
    for (const suffix of ["", "m", "7"]) {
      const chord = Chord.parse(note + suffix);
      try {
        expect(noteSet(chordLib.getPitchedNotes(chord))).toEqual(
          noteSet(chord?.asPitchedNotes() ?? null)
        );
      } catch (e) {
        throw new Error(`Error in ukulele chord ${chord}:\n${e}`);
      }
    }
  }
});

test("creates chord libs", () => {
  expect(ChordLib.for(InstrumentType.Ukulele)).toEqual(ChordLib.forUkulele());
  expect(ChordLib.for(InstrumentType.Guitar)).toEqual(ChordLib.forGuitar());

  expect(ChordLib.for(InstrumentType.UkuleleLowG).getFrets("E")).toEqual(
    ChordLib.forUkulele().getFrets("E")
  );
  expect(
    ChordLib.for(
      InstrumentType.Ukulele,
      ["G2", "C3", "E3", "A5"].map((s) => PitchedNote.parse(s))
    ).getFrets("E")
  ).toEqual(ChordLib.forUkulele().getFrets("E"));

  expect(() =>
    ChordLib.for(
      InstrumentType.Ukulele,
      ["F4", "C4", "E4", "A4"].map((s) => PitchedNote.parse(s))
    )
  ).toThrow();
  expect(() =>
    ChordLib.for(
      InstrumentType.CustomStrings,
      ["F4", "C4", "E4", "A4"].map((s) => PitchedNote.parse(s))
    )
  ).not.toThrow();
  expect(() => ChordLib.for(InstrumentType.CustomStrings)).toThrow();
});
