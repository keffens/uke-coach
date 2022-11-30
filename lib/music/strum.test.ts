import { Strum } from "./strum";

test("parses strums from string", () => {
  const strums = ".-dDuUxat1(23)*";
  expect(Strum.parse(strums, 0)).toEqual([Strum.pause(), 1]);
  expect(Strum.parse(strums, 1)).toEqual([Strum.pause(), 2]);
  expect(Strum.parse(strums, 2)).toEqual([Strum.down(), 3]);
  expect(Strum.parse(strums, 3)).toEqual([Strum.down(/*emphasize=*/ true), 4]);
  expect(Strum.parse(strums, 4)).toEqual([Strum.up(), 5]);
  expect(Strum.parse(strums, 5)).toEqual([Strum.up(/*emphasize=*/ true), 6]);
  expect(Strum.parse(strums, 6)).toEqual([Strum.percursion(), 7]);
  expect(Strum.parse(strums, 7)).toEqual([Strum.arpeggio(), 8]);
  expect(Strum.parse(strums, 8)).toEqual([Strum.tremolo(), 9]);
  expect(Strum.parse(strums, 9)).toEqual([Strum.plugged([1]), 10]);
  expect(Strum.parse(strums, 10)).toEqual([Strum.plugged([2, 3]), 14]);
  expect(Strum.parse(strums, 14)).toEqual([Strum.rest(), 15]);
});

test("parsing strums fails for invalid patterns", () => {
  const strums = "F()(23";
  expect(() => Strum.parse(strums, 0)).toThrow();
  expect(() => Strum.parse(strums, 1)).toThrow();
  expect(() => Strum.parse(strums, 2)).toThrow();
  expect(() => Strum.parse(strums, 3)).toThrow();
});

test("converts strums to strings", () => {
  expect(Strum.pause().toString()).toEqual("-");
  expect(Strum.rest().toString()).toEqual("*");
  expect(Strum.down().toString()).toEqual("d");
  expect(Strum.down(/*emphasize=*/ true).toString()).toEqual("D");
  expect(Strum.up().toString()).toEqual("u");
  expect(Strum.up(/*emphasize=*/ true).toString()).toEqual("U");
  expect(Strum.percursion().toString()).toEqual("x");
  expect(Strum.arpeggio().toString()).toEqual("a");
  expect(Strum.tremolo().toString()).toEqual("t");
  expect(Strum.plugged([1]).toString()).toEqual("1");
  expect(Strum.plugged([2, 4, 3]).toString()).toEqual("(234)");
  expect(Strum.plugged([1, 5, 1, 5, 3, 1]).toString()).toEqual("(135)");
});

test("converts tabs to string", () => {
  let tab = Strum.tab([-1, 0, 5, 10]);

  expect(tab.toString()).toEqual("[- 0 5 10]");

  expect(tab.toString(0)).toEqual("-");
  expect(tab.toString(1)).toEqual("0");
  expect(tab.toString(2)).toEqual("5");
  expect(tab.toString(3)).toEqual("(10)");

  let pause = Strum.tab([-1, -1]);
  expect(pause.toString(0)).toEqual("-");
  expect(pause.toString(1)).toEqual("-");
});

test("parses the tab notation", () => {
  const tab = "[- 0 5 10]-[1 2 3 4]";
  expect(Strum.parse(tab, 0)).toEqual([Strum.tab([-1, 0, 5, 10]), 10]);
  expect(Strum.parse(tab, 10)).toEqual([Strum.pause(), 11]);
  expect(Strum.parse(tab, 11)).toEqual([Strum.tab([1, 2, 3, 4]), tab.length]);
});

test("returns whether strums use chords", () => {
  expect(Strum.down().usesChord()).toEqual(true);
  expect(Strum.up().usesChord()).toEqual(true);
  expect(Strum.arpeggio().usesChord()).toEqual(true);
  expect(Strum.tremolo().usesChord()).toEqual(true);
  expect(Strum.plugged([1]).usesChord()).toEqual(true);

  expect(Strum.pause().usesChord()).toEqual(false);
  expect(Strum.percursion().usesChord()).toEqual(false);
  expect(Strum.tab([-1, 0, 5, 10]).usesChord()).toEqual(false);
});
