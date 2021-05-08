import { Chord } from "./chord";
import { ChordLib } from "./chord_lib";
import { Note, PitchedNote, toSharp } from "./note";
import { Token, TokenType } from "./token";

test("gets default chords frets", () => {
  const chordLib = ChordLib.forUkulele();
  expect(chordLib.getFrets(Chord.parse("C"))).toEqual([0, 0, 0, 3]);
  expect(chordLib.getFrets(Chord.parse("C#"))).toEqual([1, 1, 1, 4]);
  expect(chordLib.getFrets(Chord.parse("Db"))).toEqual([1, 1, 1, 4]);
  expect(chordLib.getFrets(Chord.parse("E"))).toEqual([4, 4, 4, -1]);
  expect(chordLib.getFrets(null)).toBeNull();
});

test("gets generated chord frets", () => {
  const chordLib = ChordLib.forUkulele();
  expect(chordLib.getFrets(Chord.parse("Cmaj7"))).toEqual([0, 0, 0, 2]);
  expect(chordLib.getFrets(Chord.parse("Caug"))).toEqual([1, 0, 0, 3]);
  expect(chordLib.getFrets(Chord.parse("Gdim"))).toEqual([0, 1, 3, 1]);
});

test("gets default chords string frets", () => {
  const chordLib = ChordLib.forUkulele();
  expect(chordLib.getStringFrets(Chord.parse("C"))).toEqual([
    "0",
    "0",
    "0",
    "3",
  ]);
  expect(chordLib.getStringFrets(Chord.parse("E"))).toEqual([
    "4",
    "4",
    "4",
    "X",
  ]);
  expect(chordLib.getFrets(null)).toBeNull();
});

test("gets pitched notes", () => {
  const chordLib = ChordLib.forUkulele();
  const strings = ["G4", "C4", "E4", "A4"].map((s) => PitchedNote.parse(s));
  expect(
    chordLib
      .getPitchedNotes(Chord.parse("C"), strings)
      ?.map((note) => (note === null ? null : note.toString()))
  ).toEqual(["G4", "C4", "E4", "C5"]);
  expect(
    chordLib
      .getPitchedNotes(Chord.parse("E"), strings)
      ?.map((note) => (note === null ? null : note.toString()))
  ).toEqual(["B4", "E4", "G#4", null]);
  expect(chordLib.getPitchedNotes(null, strings)).toBeNull();
});

test("gets custom chords frets", () => {
  const chordLib = ChordLib.forUkulele();
  // Overwrite default chord.
  expect(chordLib.getFrets(Chord.parse("C"))).toEqual([0, 0, 0, 3]);
  chordLib.defineChord(Chord.parse("C")!, [5, 4, 3, 3]);
  expect(chordLib.getFrets(Chord.parse("C"))).toEqual([5, 4, 3, 3]);

  // Overwrites generated chord.
  expect(chordLib.getFrets(Chord.parse("Bm7"))).toEqual([2, 2, 2, 0]);
  chordLib.defineChord(Chord.parse("Bm7")!, [2, 2, 2, 2]);
  expect(chordLib.getFrets(Chord.parse("Bm7"))).toEqual([2, 2, 2, 2]);
});

test("parses custom chord frets", () => {
  const chordLib = ChordLib.forUkulele();
  expect(chordLib.getFrets(Chord.parse("C"))).toEqual([0, 0, 0, 3]);
  chordLib.parseChord(new Token(TokenType.ChordDefinition, "C", "5 4 3 3"));
  expect(chordLib.getFrets(Chord.parse("C"))).toEqual([5, 4, 3, 3]);

  chordLib.parseChord(new Token(TokenType.ChordDefinition, "C", "12 12 12 x"));
  expect(chordLib.getFrets(Chord.parse("C"))).toEqual([12, 12, 12, -1]);
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
  const strings = ["G4", "C4", "E4", "A4"].map((s) => PitchedNote.parse(s));

  for (const note of Object.values(Note)) {
    for (const suffix of ["", "m", "7"]) {
      const chord = Chord.parse(note + suffix);
      try {
        expect(noteSet(chordLib.getPitchedNotes(chord, strings))).toEqual(
          noteSet(chord?.asPitchedNotes() ?? null)
        );
      } catch (e) {
        throw new Error(`Error in ukulele chord ${chord}:\n${e}`);
      }
    }
  }
});
