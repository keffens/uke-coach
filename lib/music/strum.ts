export enum StrumType {
  Pause,
  Down,
  Up,
  Percursion,
  Arpeggio,
  Plugged,
}

export class Strum {
  private constructor(
    readonly type: StrumType,
    readonly emphasize = false,
    readonly strings?: number[]
  ) {}

  static pause() {
    return new Strum(StrumType.Pause);
  }

  static down(emphasize = false) {
    return new Strum(StrumType.Down, emphasize);
  }

  static up(emphasize = false) {
    return new Strum(StrumType.Up, emphasize);
  }

  static percursion() {
    return new Strum(StrumType.Percursion);
  }

  static arpeggio() {
    return new Strum(StrumType.Arpeggio);
  }

  static plugged(strings: number[]) {
    return new Strum(StrumType.Plugged, false, strings);
  }

  // Reads 1 Strum from the pattern starting at the given position.
  // Returns the position after the last character that was read.
  static parse(pattern: string, pos: number): [Strum, number] {
    switch (pattern[pos].toLowerCase()) {
      case "-":
      case ".":
        return [Strum.pause(), pos + 1];
      case "d":
        return [Strum.down(pattern[pos] == "D"), pos + 1];
      case "u":
        return [Strum.up(pattern[pos] == "U"), pos + 1];
      case "x":
        return [Strum.percursion(), pos + 1];
      case "a":
        return [Strum.arpeggio(), pos + 1];
    }
    if (pattern[pos] >= "1" && pattern[pos] <= "9") {
      return [Strum.plugged([parseInt(pattern[pos])]), pos + 1];
    }
    if (pattern[pos] === "(") {
      pos++;
      const strings = new Array<number>();
      while (pos < pattern.length && pattern[pos] !== ")") {
        const string = parseInt(pattern[pos]);
        if (string >= 1 && string <= 9) {
          strings.push(string);
        } else {
          throw new Error(
            `Failed to parse parenthesized chord in pattern "${pattern}".`
          );
        }
        pos++;
      }
      if (pos >= pattern.length) {
        throw new Error(
          `Failed to parse parenthesized chord in pattern "${pattern}".`
        );
      }
      strings.sort((a, b) => a - b);
      return [Strum.plugged(strings), pos + 1];
    }
    throw new Error(
      `There's no strum associated with "${pattern[pos]}" in pattern ` +
        `"${pattern}".`
    );
  }

  toString() {
    switch (this.type) {
      case StrumType.Pause:
        return "-";
      case StrumType.Down:
        return this.emphasize ? "D" : "d";
      case StrumType.Up:
        return this.emphasize ? "U" : "u";
      case StrumType.Percursion:
        return "x";
      case StrumType.Arpeggio:
        return "a";
      case StrumType.Plugged:
        return this.strings.length === 1
          ? this.strings[0]
          : `(${this.strings.join("")})`;
      default:
        throw new Error(`Unknown strum StrumType: "${this.type}"`);
    }
  }
}
