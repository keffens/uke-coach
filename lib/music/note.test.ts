import {
  Note,
  PitchedNote,
  renderNote,
  parseBeats,
  sumBeats,
  toFlat,
  toSharp,
} from "./note";

test("converts sharp to flat notes", () => {
  expect(toFlat(Note.Csharp)).toEqual(Note.Dflat);
  expect(toFlat(Note.Dsharp)).toEqual(Note.Eflat);
  expect(toFlat(Note.Fsharp)).toEqual(Note.Gflat);
  expect(toFlat(Note.Gsharp)).toEqual(Note.Aflat);
  expect(toFlat(Note.Asharp)).toEqual(Note.Bflat);

  expect(toFlat(Note.C)).toEqual(Note.C);
  expect(toFlat(Note.Aflat)).toEqual(Note.Aflat);
});

test("converts sharp to flat notes", () => {
  expect(toSharp(Note.Dflat)).toEqual(Note.Csharp);
  expect(toSharp(Note.Eflat)).toEqual(Note.Dsharp);
  expect(toSharp(Note.Gflat)).toEqual(Note.Fsharp);
  expect(toSharp(Note.Aflat)).toEqual(Note.Gsharp);
  expect(toSharp(Note.Bflat)).toEqual(Note.Asharp);

  expect(toSharp(Note.C)).toEqual(Note.C);
  expect(toSharp(Note.Asharp)).toEqual(Note.Asharp);
});

test("converts sharp to flat notes", () => {
  expect(toFlat(Note.Csharp)).toEqual(Note.Dflat);
  expect(toFlat(Note.Gsharp)).toEqual(Note.Aflat);
  expect(toFlat(Note.Asharp)).toEqual(Note.Bflat);
  expect(toFlat(Note.C)).toEqual(Note.C);
  expect(toFlat(Note.Aflat)).toEqual(Note.Aflat);
});

test("renders notes", () => {
  expect(renderNote(Note.C)).toEqual("C");
  expect(renderNote(Note.Csharp)).toEqual("C♯");
  expect(renderNote(Note.A)).toEqual("A");
  expect(renderNote(Note.Aflat)).toEqual("A♭");
  expect(renderNote(Note.B)).toEqual("B");

  expect(renderNote("E#")).toEqual("E♯");
  expect(renderNote("Fb")).toEqual("F♭");
});

test("creates pitched notes", () => {
  const c4 = PitchedNote.fromNote(Note.C);
  expect(c4.note).toEqual(Note.C);
  expect(c4.octave).toEqual(4);

  const d3 = PitchedNote.fromNote(Note.D, 3);
  expect(d3.note).toEqual(Note.D);
  expect(d3.octave).toEqual(3);

  const aSharpNeg = PitchedNote.fromNote(Note.Asharp, -1);
  expect(aSharpNeg.note).toEqual(Note.Asharp);
  expect(aSharpNeg.octave).toEqual(-1);

  const bFlat9 = PitchedNote.fromNote(Note.Bflat, 9);
  expect(bFlat9.note).toEqual(Note.Bflat);
  expect(bFlat9.octave).toEqual(9);

  const gFlatFromFSharp = PitchedNote.fromNote(Note.Fsharp, 4, true);
  expect(gFlatFromFSharp.note).toEqual(Note.Gflat);
  expect(gFlatFromFSharp.octave).toEqual(4);
});

test("converts between strings and pitched notes", () => {
  expect(PitchedNote.parse("C").toString()).toEqual("C4");
  expect(PitchedNote.parse("A4").toString()).toEqual("A4");
  expect(PitchedNote.parse("C#-1").toString()).toEqual("C#-1");
  expect(PitchedNote.parse("Db9").toString()).toEqual("Db9");
});

test("adds semitones to pitched notes", () => {
  expect(PitchedNote.parse("C4").addSemitones(0).toString()).toEqual("C4");
  expect(PitchedNote.parse("C4").addSemitones(1).toString()).toEqual("C#4");
  expect(PitchedNote.parse("C4").addSemitones(-1).toString()).toEqual("B3");
  expect(PitchedNote.parse("C4").addSemitones(12).toString()).toEqual("C5");
  expect(PitchedNote.parse("G7").addSemitones(3).toString()).toEqual("A#7");
  expect(PitchedNote.parse("G#3").addSemitones(2).toString()).toEqual("A#3");

  // Smallest possible value.
  expect(PitchedNote.parse("C-1").addSemitones(0).toString()).toEqual("C-1");
  expect(PitchedNote.parse("C-1").addSemitones(-1).toString()).toEqual("B-1");
  expect(PitchedNote.parse("C-1").addSemitones(-24).toString()).toEqual("C-1");

  // Largest possible value.
  expect(PitchedNote.parse("B9").addSemitones(0).toString()).toEqual("B9");
  expect(PitchedNote.parse("B9").addSemitones(1).toString()).toEqual("C9");
  expect(PitchedNote.parse("B9").addSemitones(24).toString()).toEqual("B9");

  // Uses flat for root notes which use flats in major scale.
  expect(PitchedNote.parse("F4").addSemitones(1).toString()).toEqual("Gb4");
  expect(PitchedNote.parse("Gb4").addSemitones(2).toString()).toEqual("Ab4");
});

test("makes a chord from a pitched notes", () => {
  const C = PitchedNote.parse("C4").makeChord([0, 4, 7]);
  expect(C.map((note) => note.toString())).toEqual(["C4", "E4", "G4"]);
  const Am = PitchedNote.parse("A4").makeChord([0, 3, 7]);
  expect(Am.map((note) => note.toString())).toEqual(["A4", "C5", "E5"]);
  const B = PitchedNote.parse("B3").makeChord([0, 4, 7]);
  expect(B.map((note) => note.toString())).toEqual(["B3", "D#4", "F#4"]);
});

test("parses beats", () => {
  expect(parseBeats(".")).toEqual(1);
  expect(parseBeats(".....")).toEqual(5);
  expect(parseBeats(".,")).toEqual(1.5);
  expect(parseBeats(".:")).toEqual(1.25);
  expect(parseBeats(".;")).toEqual(1.125);

  expect(parseBeats("'")).toBeCloseTo(2 / 3);
  expect(parseBeats(`"`)).toBeCloseTo(1 / 3);
  expect(parseBeats("'''")).toBeCloseTo(2);
  expect(parseBeats(`"""`)).toBeCloseTo(1);

  expect(parseBeats("")).toEqual(4);
  expect(parseBeats("_")).toEqual(4);
  expect(parseBeats("__")).toEqual(8);
  expect(parseBeats("", /*beatsInBar=*/ 3)).toEqual(3);
  expect(parseBeats("_", /*beatsInBar=*/ 3)).toEqual(3);

  expect(parseBeats("C..")).toEqual(2);
});

test("sums beats", () => {
  expect(sumBeats([])).toEqual(0);
  expect(sumBeats([1, 1])).toEqual(2);
  expect(sumBeats([1, 1.5, 0.25, 3])).toEqual(5.75);
  expect(sumBeats([1 / 3, 2 / 3])).toEqual(1);
  expect(sumBeats([1 / 8, 1 / 3, 1 / 2, 1 / 3, 3 / 8, 1 / 3])).toEqual(2);
});
