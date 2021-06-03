import { escapeRegExp } from "./escape";

test("escapes regular expressions", () => {
  expect(escapeRegExp(String.raw`[hello] (world)\n`)).toEqual(
    String.raw`\[hello\] \(world\)\\n`
  );
});
