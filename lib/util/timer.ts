/** Wrapper class for a setInterval and clearInterval. */
export class Interval {
  // Node uses `NodeJS.Timeout` while jest expects `number`.
  private id?: ReturnType<typeof setInterval>;

  set(fn: () => void, interval: number): void {
    this.clear();
    this.id = setInterval(fn, interval);
  }

  clear(): void {
    if (this.id) clearInterval(this.id);
    this.id = undefined;
  }

  get active(): boolean {
    return this.id != null;
  }
}

/** Wrapper class for a setTimeout and clearTimeout. */
export class Timeout {
  // Node uses `NodeJS.Timeout` while jest expects `number`.
  private id?: ReturnType<typeof setTimeout>;

  set(fn: () => void, timeout: number): void {
    this.clear();
    this.id = setTimeout(fn, timeout);
  }

  clear(): void {
    if (this.id) clearTimeout(this.id);
    this.id = undefined;
  }

  get active(): boolean {
    return this.id != null;
  }
}
