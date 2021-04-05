import { range } from "./range";

test("creates range with endpoint", () => {
  expect(range(5)).toEqual([0, 1, 2, 3, 4]);
});

test("creates range with start and end", () => {
  expect(range(3, 7)).toEqual([3, 4, 5, 6]);
});

test("creates range with start, end, and step", () => {
  expect(range(3, 7, 2)).toEqual([3, 5]);
});

test("creates range using floats", () => {
  expect(range(3.5, 4.3, 0.25)).toEqual([3.5, 3.75, 4.0, 4.25]);
});
