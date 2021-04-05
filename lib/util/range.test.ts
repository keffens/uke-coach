import { range } from "./range";

test("creates range with endpoint", () => {
  expect(range(5)).toEqual([0, 1, 2, 3, 4]);
});

test("creates ranges with start and end", () => {
  expect(range(3, 7)).toEqual([3, 4, 5, 6]);
  expect(range(-2, 1)).toEqual([-2, -1, 0]);
  expect(range(-2, 0)).toEqual([-2, -1]);
});

test("creates range with start, end, and step", () => {
  expect(range(3, 7, 2)).toEqual([3, 5]);
  expect(range(7, 3, -1)).toEqual([7, 6, 5, 4]);
});

test("creates ranges using floats", () => {
  expect(range(3.5, 5.5)).toEqual([3.5, 4.5]);
  expect(range(3.5, 4.3, 0.25)).toEqual([3.5, 3.75, 4.0, 4.25]);
});

test("creates empty ranges", () => {
  expect(range(0)).toEqual([]);
  expect(range(3, 3)).toEqual([]);
  expect(range(-5, -6)).toEqual([]);
  expect(range(3, 7, -1)).toEqual([]);
  expect(range(3, 7, 0)).toEqual([]);
});
