import { Strum } from "./strum";

test("parses strums from string", () => {
  const strums = ".-dDuUxat1(23)";
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
});

test("parsing strums fails for invalid patterns", () => {
  const strums = "F()(23";
  expect(() => Strum.parse(strums, 0)).toThrow();
  expect(() => Strum.parse(strums, 1)).toThrow();
  expect(() => Strum.parse(strums, 2)).toThrow();
  expect(() => Strum.parse(strums, 3)).toThrow();
});

test("converts strums to strings", () => {
  expect(Strum.pause().toString()).toBe("-");
  expect(Strum.down().toString()).toBe("d");
  expect(Strum.down(/*emphasize=*/ true).toString()).toBe("D");
  expect(Strum.up().toString()).toBe("u");
  expect(Strum.up(/*emphasize=*/ true).toString()).toBe("U");
  expect(Strum.percursion().toString()).toBe("x");
  expect(Strum.arpeggio().toString()).toBe("a");
  expect(Strum.tremolo().toString()).toBe("t");
  expect(Strum.plugged([1]).toString()).toBe("1");
  expect(Strum.plugged([2, 4, 3]).toString()).toBe("(234)");
  expect(Strum.plugged([1, 5, 1, 5, 3, 1]).toString()).toBe("(135)");
});
