export function range(startOrEnd: number, end?: number, step = 1) {
  const start = end == null ? 0 : startOrEnd;
  end = end ?? startOrEnd;
  const res = new Array<number>();
  for (let i = start; i < end; i += step) {
    res.push(i);
  }
  return res;
}
