/** Returns true if the given value is of type string. */
export function isString(val: any): boolean {
  return typeof val === "string";
}

/** Returns `val` if it is a string and `undefined` otherwise. */
export function toStringOrUndef(val: any): string | undefined {
  return isString(val) ? val : undefined;
}

/** Deletes all undefined fields from a given input object. */
export function delUndefined<
  T extends {
    [key: string]: any;
  }
>(obj: T): T {
  for (const key of Object.keys(obj)) {
    if (obj[key] === undefined) {
      delete obj[key];
    }
  }
  return obj;
}
