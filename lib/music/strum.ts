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
    readonly strum: StrumType,
    readonly emphasize = false,
    readonly fingers?: number[]
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

  static plugged(fingers: number[]) {
    return new Strum(StrumType.Plugged, false, fingers);
  }

  // Reads 1 Strum from the pattern starting at the given position.
  // Returns the position after the last character that was read.
  static parse(pattern: string, pos: number): [Strum, number] {
    // TODO: Handle parenthesized chords.
    switch (pattern[pos].toLowerCase()) {
      case "-":
      case " ":
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
      default:
        throw new Error(
          `There's no strum associated with letter ${pattern[pos]}`
        );
    }
  }

  toString() {
    switch (this.strum) {
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
        return this.fingers.length === 1
          ? this.fingers[0]
          : `(${this.fingers.join("")})`;
      default:
        throw new Error(`Unknown strum StrumType: "${this.strum}"`);
    }
  }
}
