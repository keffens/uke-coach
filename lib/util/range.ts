/**
 * If one value x is given, returns the integer interval [0, x). If two values
 * x and y are given, returns [x, y). If a positive step value is given, returns
 * [x, x + step, x + 2*step, ... ] for all values smaller than y. If a negative
 * step value is given, returns [x, x + step, x + 2*step, ... ] for all values
 * larger than y.
 */
export function range(x: number, y?: number, step = 1): number[] {
  const start = y == null ? 0 : x;
  const end = y ?? x;
  const res = new Array<number>();
  if (step > 0) {
    for (let i = start; i < end; i += step) {
      res.push(i);
    }
  } else if (step < 0) {
    for (let i = start; i > end; i += step) {
      res.push(i);
    }
  }
  return res;
}
