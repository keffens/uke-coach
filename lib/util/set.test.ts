import { setUnion } from "./set";

test("unites sets", () => {
  expect(
    setUnion(new Set([1, 3, 5]), new Set([2, 5, 7]), new Set([0, 9]))
  ).toEqual(new Set([0, 1, 2, 3, 5, 7, 9]));
});
