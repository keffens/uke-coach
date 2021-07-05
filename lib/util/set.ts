export function setUnion<T>(...sets: Set<T>[]): Set<T> {
  const result = new Set<T>();
  for (const set of sets) {
    for (const val of set) {
      result.add(val);
    }
  }
  return result;
}
