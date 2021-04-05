import { Note, renderNote, parseBeats, sumBeats } from "./note";

test("renders notes", () => {
  expect(renderNote(Note.C)).toBe("C");
  expect(renderNote(Note.Csharp)).toBe("C♯");
  expect(renderNote(Note.A)).toBe("A");
  expect(renderNote(Note.Aflat)).toBe("A♭");
  expect(renderNote(Note.B)).toBe("B");

  expect(renderNote("E#")).toBe("E♯");
  expect(renderNote("Fb")).toBe("F♭");
});

test("parses beats", () => {
  expect(parseBeats(".")).toBe(1);
  expect(parseBeats(".....")).toBe(5);
  expect(parseBeats(".,")).toBe(1.5);
  expect(parseBeats(".:")).toBe(1.25);
  expect(parseBeats(".;")).toBe(1.125);

  expect(parseBeats("'")).toBeCloseTo(2 / 3);
  expect(parseBeats(`"`)).toBeCloseTo(1 / 3);
  expect(parseBeats("'''")).toBeCloseTo(2);
  expect(parseBeats(`"""`)).toBeCloseTo(1);

  expect(parseBeats("")).toBe(4);
  expect(parseBeats("_")).toBe(4);
  expect(parseBeats("__")).toBe(8);
  expect(parseBeats("", /*beatsInBar=*/ 3)).toBe(3);
  expect(parseBeats("_", /*beatsInBar=*/ 3)).toBe(3);

  expect(parseBeats("C..")).toBe(2);
});

test("sums beats", () => {
  expect(sumBeats([])).toBe(0);
  expect(sumBeats([1, 1])).toBe(2);
  expect(sumBeats([1, 1.5, 0.25, 3])).toBe(5.75);
  expect(sumBeats([1 / 3, 2 / 3])).toBe(1);
  expect(sumBeats([1 / 8, 1 / 3, 1 / 2, 1 / 3, 3 / 8, 1 / 3])).toBe(2);
});
