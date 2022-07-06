export function assert(
  condition: any,
  msg: string,
  obj?: any
): asserts condition {
  if (!condition) {
    if (obj) console.log("Assertion failure in:", obj);
    throw new Error(msg);
  }
}
