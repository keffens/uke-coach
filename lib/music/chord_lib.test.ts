import { Chord } from "./chord";
import { ChordLib } from "./chord_lib";

test("gets default chords frets", () => {
  const chordLib = ChordLib.forUkulele();
  expect(chordLib.getFrets(Chord.parse("C"))).toEqual([0, 0, 0, 3]);
  expect(chordLib.getFrets(Chord.parse("C#"))).toEqual([1, 1, 1, 4]);
  expect(chordLib.getFrets(Chord.parse("Db"))).toEqual([1, 1, 1, 4]);
  expect(chordLib.getFrets(Chord.parse("E"))).toEqual([4, 4, 4, -1]);
  expect(chordLib.getFrets(Chord.parse("C6"))).toBeNull();
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
