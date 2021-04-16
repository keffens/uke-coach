import { TICKS_PER_BEAT } from "./note";
import { TimeSignature } from "./signature";
import { Strum } from "./strum";
import { Token, TokenType } from "./token";

/** Represents a strumming pattern over a specified number of bars. */
export class Pattern {
  private constructor(
    readonly time: TimeSignature,
    readonly strums: Strum[],
    readonly bars = 1,
    readonly name?: string
  ) {
    if (bars === 0 && strums.length === 0) return;
    if (strums.length % bars !== 0) {
      throw new Error(
        `Cannot create pattern with ${strums.length} strums and ` +
          `${bars} bars.`
      );
    }
    if (this.strumsPerBar % time.beats !== 0) {
      throw new Error(
        `Cannot create pattern with ${this.strumsPerBar} strums and ` +
          `${time.beats} beats per bar.`
      );
    }
    if (TICKS_PER_BEAT % this.strumsPerBeat !== 0) {
      throw new Error(
        `The number of strums per beat (${this.strumsPerBeat}) must divide ` +
          `${TICKS_PER_BEAT}.`
      );
    }
  }

  /** Creates an empty (only pauses) pattern for the given time signature. */
  static makeEmpty(
    time: TimeSignature,
    bars: number = 1,
    strumsPerBar?: number
  ): Pattern {
    strumsPerBar = strumsPerBar ?? 2 * time.beats;
    return new Pattern(
      time,
      Array(bars * strumsPerBar).fill(Strum.pause()),
      bars
    );
  }

  /** Creates a pattern with a single down stroke on 1. */
  static makeDefault(time: TimeSignature): Pattern {
    const strums = Array(time.beats * 2).fill(Strum.pause());
    strums[0] = Strum.down();
    return new Pattern(time, strums, 1);
  }

  /** Parses a pattern from a string. */
  static parse(pattern: string, time: TimeSignature, name?: string): Pattern {
    const strums = new Array<Strum>();
    let pos = 0;
    let bars = 1;
    let spb = 0;
    while (pos < pattern.length) {
      if (pattern[pos] === "|") {
        // Verify the number of strums per bar is consistent.
        if (pos !== 0 && bars === 1) {
          spb = strums.length;
        } else if (spb * bars !== strums.length) {
          throw new Error(
            `String pattern ${pattern} does have the same number of strums ` +
              `in each bar.`
          );
        }
        if (pos !== 0 && pos !== pattern.length - 1) {
          bars++;
        }
        pos++;
        continue;
      }
      let strum: Strum;
      [strum, pos] = Strum.parse(pattern, pos);
      strums.push(strum);
    }
    if (!strums.length) {
      bars = 0;
    }
    return new Pattern(time, strums, bars, name);
  }

  /** Parses a pattern from a Pattern token. */
  static fromToken(
    token: Token,
    time: TimeSignature,
    patterns: Map<string, Pattern>
  ): Pattern {
    if (token.type !== TokenType.Pattern) {
      throw new Error(
        `Cannot create Pattern from token with type ${token.type}.`
      );
    }
    let pattern: Pattern;
    if (!token.value) {
      pattern = patterns.get(token.key);
      if (!pattern) {
        throw new Error(`Unknown pattern name "${token.key}".`);
      }
      if (!pattern.time.equals(time)) {
        throw new Error(
          "Cannot load pattern with mismatching time signature: " +
            `${time.toString()} vs. ${pattern.time.toString()}`
        );
      }
      return pattern;
    }
    pattern = Pattern.parse(token.value, time, token.key);
    if (token.key) {
      if (patterns.has(token.key)) {
        throw new Error(`Redefinition of pattern "${token.key}".`);
      }
      patterns.set(token.key, pattern);
    }
    return pattern;
  }

  get strumsPerBar(): number {
    return this.strums.length / this.bars;
  }

  get strumsPerBeat(): number {
    return this.strumsPerBar / this.time.beats;
  }

  get ticksPerBar(): number {
    return this.time.beats * TICKS_PER_BEAT;
  }

  /**
   * Whether a tab should be used to display the pattern, i.e., the patern uses
   * string sets.
   */
  useTab(): boolean {
    return this.strums.some((s) => s.strings?.length);
  }

  /**
   * Whether this is considered a main pattern, i.e., it's a named pattern not
   * starting with a "*".
   */
  isMainPattern(): boolean {
    return !!this.name && !this.name.startsWith("*");
  }

  /** Returns the string representation of the pattern, e.g., |d-du-udu|. */
  toString(): string {
    if (this.bars === 0) return "";
    return (
      this.strums
        .map((s, i) => (i % this.strumsPerBar === 0 ? "|" : "") + s.toString())
        .join("") + "|"
    );
  }

  /** Returns the pattern as token. */
  toToken(): Token {
    return new Token(TokenType.Pattern, this.name, this.toString());
  }
}
