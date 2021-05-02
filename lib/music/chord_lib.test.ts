import { Chord } from "./chord";
import { ChordLib } from "./chord_lib";
import { PitchedNote } from "./note";

test("gets default chords frets", () => {
  const chordLib = ChordLib.forUkulele();
  expect(chordLib.getFrets(Chord.parse("C"))).toEqual([0, 0, 0, 3]);
  expect(chordLib.getFrets(Chord.parse("C#"))).toEqual([1, 1, 1, 4]);
  expect(chordLib.getFrets(Chord.parse("Db"))).toEqual([1, 1, 1, 4]);
  expect(chordLib.getFrets(Chord.parse("E"))).toEqual([4, 4, 4, -1]);
  expect(chordLib.getFrets(Chord.parse("C6"))).toBeNull();
  expect(chordLib.getFrets(null)).toBeNull();
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
  expect(chordLib.getFrets(Chord.parse("C6"))).toBeNull();
  expect(chordLib.getFrets(null)).toBeNull();
});

test("gets pitched notes", () => {
  const chordLib = ChordLib.forUkulele();
  const strings = ["G4", "C4", "E4", "A4"].map((s) => PitchedNote.parse(s));
  expect(
    chordLib
      .getPitchedNotes(Chord.parse("C"), strings)
      .map((note) => note.toString())
  ).toEqual(["G4", "C4", "E4", "C5"]);
  expect(
    chordLib
      .getPitchedNotes(Chord.parse("E"), strings)
      .map((note) => (note === null ? null : note.toString()))
  ).toEqual(["B4", "E4", "G#4", null]);
  expect(chordLib.getPitchedNotes(Chord.parse("C6"), strings)).toBeNull();
  expect(chordLib.getPitchedNotes(null, strings)).toBeNull();
});

test("gets custom chords frets", () => {
  const chordLib = ChordLib.forUkulele();
  expect(chordLib.getFrets(Chord.parse("C"))).toEqual([0, 0, 0, 3]);
  chordLib.defineChord(Chord.parse("C"), [5, 4, 3, 3]);
  expect(chordLib.getFrets(Chord.parse("C"))).toEqual([5, 4, 3, 3]);

  expect(chordLib.getFrets(Chord.parse("C6"))).toBeNull();
  chordLib.defineChord(Chord.parse("C6"), [0, 0, 0, 1]);
  expect(chordLib.getFrets(Chord.parse("C6"))).toEqual([0, 0, 0, 1]);
});
