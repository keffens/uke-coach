import { intArrayToString, parseIntArray } from "./int_array";

test("parses strings to int arrays", () => {
  expect(parseIntArray("1 2\t-2   10\n")).toEqual([1, 2, -2, 10]);
  expect(parseIntArray("1 x 2 -", { x: -1, "-": 0 }, 4)).toEqual([1, -1, 2, 0]);

  expect(() => parseIntArray("1 2 3", {}, 4)).toThrow();
  expect(() => parseIntArray("1 x 3")).toThrow();
});

test("converts int arrays to strings", () => {
  expect(intArrayToString([1, 2, -2, 10])).toEqual("1 2 -2 10");
  expect(intArrayToString([1, -1, 2, 0], { "-1": "x", 0: "-" })).toEqual(
    "1 x 2 -"
  );
});
