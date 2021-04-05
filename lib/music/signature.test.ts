import { Note, Scale } from "./note";
import { KeySignature, TimeSignature } from "./signature";

test("parses key signatures", () => {
  expect(KeySignature.parse("C")).toEqual(
    new KeySignature(Note.C, Scale.Major)
  );
  expect(KeySignature.parse("  F#  ")).toEqual(
    new KeySignature(Note.Fsharp, Scale.Major)
  );
  expect(KeySignature.parse("Abm")).toEqual(
    new KeySignature(Note.Aflat, Scale.Minor)
  );
});

test(" fails to parses invalid key signatures", () => {
  expect(() => KeySignature.parse("")).toThrow();
  expect(() => KeySignature.parse("E#")).toThrow();
  expect(() => KeySignature.parse("Cb")).toThrow();
  expect(() => KeySignature.parse("CM")).toThrow();
});

test("converts key signatures to strings", () => {
  expect(KeySignature.parse("C").toString()).toBe("C");
  expect(KeySignature.parse("F#").toString()).toBe("F#");
  expect(KeySignature.parse("Abm").toString()).toBe("Abm");
});

test("renders key signatures", () => {
  expect(KeySignature.parse("C").render()).toBe("C");
  expect(KeySignature.parse("F#").render()).toBe("F♯");
  expect(KeySignature.parse("Abm").render()).toBe("A♭m");
});

test("parses time signatures", () => {
  expect(TimeSignature.parse("3/4")).toEqual(new TimeSignature(3, 4));
  expect(TimeSignature.parse("4/4")).toEqual(TimeSignature.DEFAULT);
  expect(TimeSignature.parse("4/8")).toEqual(new TimeSignature(4, 8));
  expect(TimeSignature.parse("7/6")).toEqual(new TimeSignature(7, 6));
  expect(TimeSignature.parse("12/16")).toEqual(new TimeSignature(12, 16));
});

test("fails to parse invalid time signatures", () => {
  expect(() => TimeSignature.parse("")).toThrow();
  expect(() => TimeSignature.parse("/")).toThrow();
  expect(() => TimeSignature.parse("0/4")).toThrow();
  expect(() => TimeSignature.parse("4/0")).toThrow();
  expect(() => TimeSignature.parse("-1/4")).toThrow();
  expect(() => TimeSignature.parse("4/-4")).toThrow();
});

test("converts time signatures to strings", () => {
  expect(TimeSignature.parse("3/4").toString()).toBe("3/4");
  expect(TimeSignature.DEFAULT.toString()).toBe("4/4");
  expect(TimeSignature.parse("8/8").toString()).toBe("8/8");
});

test("verifies equality of time signatures", () => {
  expect(new TimeSignature(4, 4).equals(TimeSignature.DEFAULT)).toBe(true);
  expect(new TimeSignature(3, 4).equals(TimeSignature.parse("3/4"))).toBe(true);

  expect(TimeSignature.DEFAULT.equals(new TimeSignature(8, 8))).toBe(false);
  expect(TimeSignature.DEFAULT.equals(new TimeSignature(4, 8))).toBe(false);
  expect(TimeSignature.DEFAULT.equals(new TimeSignature(2, 4))).toBe(false);
});
