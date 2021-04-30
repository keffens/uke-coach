import { Chord } from "./chord";
import { PitchedNote } from "./note";

test("converts between strings and chords", () => {
  expect(Chord.parse("C").toString()).toEqual("C");
  expect(Chord.parse("Am").toString()).toEqual("Am");
  expect(Chord.parse("Bdim").toString()).toEqual("Bdim");
  expect(Chord.parse("Gaug").toString()).toEqual("Gaug");

  expect(Chord.parse("C6").toString()).toEqual("C6");
  expect(Chord.parse("Am6").toString()).toEqual("Am6");

  expect(Chord.parse("C7").toString()).toEqual("C7");
  expect(Chord.parse("Am7").toString()).toEqual("Am7");
  expect(Chord.parse("Bdim7").toString()).toEqual("Bdim7");
  expect(Chord.parse("Gaug7").toString()).toEqual("Gaug7");

  expect(Chord.parse("Cmaj7").toString()).toEqual("Cmaj7");
  expect(Chord.parse("Ammaj7").toString()).toEqual("Ammaj7");
});

test("makes the chord's html base", () => {
  expect(Chord.parse("C").base).toEqual("C");
  expect(Chord.parse("Am").base).toEqual("Am");
  expect(Chord.parse("Bdim").base).toEqual("B");
  expect(Chord.parse("Gaug").base).toEqual("G+");

  expect(Chord.parse("C6").base).toEqual("C");
  expect(Chord.parse("C7").base).toEqual("C");
  expect(Chord.parse("Cmaj7").base).toEqual("C");
});

test("makes the chord's html sup", () => {
  expect(Chord.parse("C").sup).toEqual("");
  expect(Chord.parse("Am").sup).toEqual("");
  expect(Chord.parse("Bdim").sup).toEqual("o");
  expect(Chord.parse("Gaug").sup).toEqual("");

  expect(Chord.parse("C6").sup).toEqual("6");
  expect(Chord.parse("C7").sup).toEqual("7");
  expect(Chord.parse("Bdim7").sup).toEqual("o7");
  expect(Chord.parse("Cmaj7").sup).toEqual("M7");
});

test("converts chords to pitched note arrays", () => {
  expect(
    Chord.parse("C")
      .asPitchedNotes()
      .map((n) => n.toString())
  ).toEqual(["C4", "E4", "G4"]);
  expect(
    Chord.parse("Am")
      .asPitchedNotes()
      .map((n) => n.toString())
  ).toEqual(["A4", "C5", "E5"]);
  expect(
    Chord.parse("Bdim")
      .asPitchedNotes()
      .map((n) => n.toString())
  ).toEqual(["B4", "D5", "F5"]);
  expect(
    Chord.parse("Gaug")
      .asPitchedNotes()
      .map((n) => n.toString())
  ).toEqual(["G4", "B4", "D#5"]);

  expect(
    Chord.parse("C6")
      .asPitchedNotes()
      .map((n) => n.toString())
  ).toEqual(["C4", "E4", "G4", "A4"]);
  expect(
    Chord.parse("Am6")
      .asPitchedNotes()
      .map((n) => n.toString())
  ).toEqual(["A4", "C5", "E5", "F#5"]);

  expect(
    Chord.parse("C7")
      .asPitchedNotes()
      .map((n) => n.toString())
  ).toEqual(["C4", "E4", "G4", "A#4"]);
  expect(
    Chord.parse("Am7")
      .asPitchedNotes()
      .map((n) => n.toString())
  ).toEqual(["A4", "C5", "E5", "G5"]);
  expect(
    Chord.parse("Bdim7")
      .asPitchedNotes()
      .map((n) => n.toString())
  ).toEqual(["B4", "D5", "F5", "G#5"]);
  expect(
    Chord.parse("Gaug7")
      .asPitchedNotes()
      .map((n) => n.toString())
  ).toEqual(["G4", "B4", "D#5", "F5"]);

  expect(
    Chord.parse("Cmaj7")
      .asPitchedNotes()
      .map((n) => n.toString())
  ).toEqual(["C4", "E4", "G4", "B4"]);
  expect(
    Chord.parse("Ammaj7")
      .asPitchedNotes()
      .map((n) => n.toString())
  ).toEqual(["A4", "C5", "E5", "G#5"]);

  expect(
    Chord.parse("C")
      .asPitchedNotes(PitchedNote.parse("E2"))
      .map((n) => n.toString())
  ).toEqual(["C3", "E3", "G3"]);
});
