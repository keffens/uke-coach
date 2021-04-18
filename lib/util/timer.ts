/** Wrapper class for a setInterval and clearInterval. */
export class Interval {
  private id?: NodeJS.Timeout;

  set(fn: () => void, interval: number): void {
    this.clear();
    this.id = setInterval(fn, interval);
  }

  clear(): void {
    if (this.id) clearInterval(this.id);
  }
}

/** Wrapper class for a setTimeout and clearTimeout. */
export class Timeout {
  private id?: NodeJS.Timeout;

  set(fn: () => void, timeout: number): void {
    this.clear();
    this.id = setTimeout(fn, timeout);
  }

  clear(): void {
    if (this.id) clearTimeout(this.id);
  }
}
