import { assert, intArrayToString, parseIntArray } from "../util";

const TAB_RE = new RegExp(String.raw`^\[([-0-9 ]+)\]`);

export enum StrumType {
  Pause,
  Rest,
  Down,
  Up,
  Percursion,
  Arpeggio,
  Tremolo,
  Plugged,
  Tab,
}

/** Represents a single strum type, stroke, or a set of plugged strings. */
export class Strum {
  private constructor(
    readonly type: StrumType,
    readonly emphasize = false,
    readonly strings: number[] = [],
    readonly frets: number[] = []
  ) {}

  /** Creates a pause. */
  static pause(): Strum {
    return new Strum(StrumType.Pause);
  }

  /** Creates a rest. */
  static rest(): Strum {
    return new Strum(StrumType.Rest);
  }

  /** Creates a down stroke. */
  static down(emphasize = false): Strum {
    return new Strum(StrumType.Down, emphasize);
  }

  /** Creates a up stroke. */
  static up(emphasize = false): Strum {
    return new Strum(StrumType.Up, emphasize);
  }

  /** Creates a percursion. */
  static percursion(): Strum {
    return new Strum(StrumType.Percursion);
  }

  /** Creates an arpeggio. */
  static arpeggio(): Strum {
    return new Strum(StrumType.Arpeggio);
  }

  /** Creates an tremolo. */
  static tremolo(): Strum {
    return new Strum(StrumType.Tremolo);
  }

  /**
   * Creates a plugged strum using the given strings. A 0 indicates the
   * base/root note.
   */
  static plugged(strings: number[]): Strum {
    if (!strings.length) {
      throw new Error("Plugged strum requires a string set.");
    }
    // Sort and deduplicate the array.
    strings.sort((a, b) => a - b);
    strings = strings.filter((s, i) => s !== strings[i + 1]);
    return new Strum(StrumType.Plugged, false, strings);
  }

  /** Creates one beat in a tab. */
  static tab(frets: number[]): Strum {
    if (!frets.length) {
      throw new Error("Tabs require a frets set.");
    }
    if (frets.every((fret) => fret < 0)) return Strum.pause();
    return new Strum(StrumType.Tab, false, [], frets);
  }

  /**
   * Reads 1 Strum from the pattern starting at the given position. Returns the
   * position after the last character that was read.
   */
  static parse(pattern: string, pos: number): [Strum, number] {
    const match = pattern.substring(pos).match(TAB_RE);
    if (match) {
      return [
        Strum.tab(parseIntArray(match[1], { "-": -1 })),
        pos + match[0].length,
      ];
    }
    switch (pattern[pos].toLowerCase()) {
      case "-":
      case ".":
        return [Strum.pause(), pos + 1];
      case "*":
        return [Strum.rest(), pos + 1];
      case "d":
        return [Strum.down(pattern[pos] == "D"), pos + 1];
      case "u":
        return [Strum.up(pattern[pos] == "U"), pos + 1];
      case "x":
        return [Strum.percursion(), pos + 1];
      case "a":
        return [Strum.arpeggio(), pos + 1];
      case "t":
        return [Strum.tremolo(), pos + 1];
    }
    if (pattern[pos] >= "0" && pattern[pos] <= "9") {
      return [Strum.plugged([parseInt(pattern[pos])]), pos + 1];
    }
    if (pattern[pos] === "(") {
      pos++;
      const strings = new Array<number>();
      while (pos < pattern.length && pattern[pos] !== ")") {
        const string = parseInt(pattern[pos]);
        assert(
          string >= 0 && string <= 9,
          `Failed to parse parenthesized chord in pattern "${pattern}".`
        );
        strings.push(string);
        pos++;
      }
      assert(
        pos < pattern.length,
        `Failed to parse parenthesized chord in pattern "${pattern}".`
      );
      return [Strum.plugged(strings), pos + 1];
    }
    throw new Error(
      `There's no strum associated with "${pattern[pos]}" in pattern ` +
        `"${pattern}".`
    );
  }

  /**
   * Converts the strum to its string representation. For tabs, requires the
   * string to be set.
   */
  toString(string?: number): string {
    switch (this.type) {
      case StrumType.Pause:
        return "-";
      case StrumType.Rest:
        return "*";
      case StrumType.Down:
        return this.emphasize ? "D" : "d";
      case StrumType.Up:
        return this.emphasize ? "U" : "u";
      case StrumType.Percursion:
        return "x";
      case StrumType.Arpeggio:
        return "a";
      case StrumType.Tremolo:
        return "t";
      case StrumType.Plugged:
        return this.strings.length === 1
          ? `${this.strings[0]}`
          : `(${this.strings.join("")})`;
      case StrumType.Tab:
        if (string == null) {
          return `[${intArrayToString(this.frets, { "-1": "-" })}]`;
        }
        const fret = this.frets[string];
        if (fret < 0) return "-";
        if (fret <= 9) return `${fret}`;
        return `(${fret})`;
      default:
        throw new Error(`Unknown strum StrumType: "${this.type}"`);
    }
  }

  /** Whether this strum uses a chord or works standalone. */
  usesChord(): boolean {
    return ![
      StrumType.Pause,
      StrumType.Rest,
      StrumType.Percursion,
      StrumType.Tab,
    ].includes(this.type);
  }
}
