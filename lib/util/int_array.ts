import { assert } from "./assert";

/**
 * Parses a string into an integer and optionally assert the length of the
 * returned array. `mapping` is used for special values, e.g., { x: -1 }.
 */
export function parseIntArray(
  str: string,
  mapping?: { [key: string]: number },
  assertLength?: number
): number[] {
  const vals = str
    .trim()
    .split(/\s+/)
    .map((s) => {
      let v = mapping?.[s] ?? parseInt(s);
      assert(!isNaN(v), `Could not parse value ${s} in ${str} as integer`);
      return v;
    });
  assert(
    assertLength == null || assertLength === vals.length,
    `Expected ${assertLength} values in ${str}, got ${vals.length}`
  );
  return vals;
}

/**
 * Convertsa an integer array to string, using a `mapping` for some values,
 * e.g., { "-1": "x" }.
 */
export function intArrayToString(
  vals: number[],
  mapping?: { [key: number]: string }
): string {
  return vals.map((v) => mapping?.[v] ?? v).join(" ");
}
