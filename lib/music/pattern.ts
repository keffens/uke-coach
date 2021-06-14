import { TICKS_PER_BEAT } from "./note";
import { TimeSignature } from "./signature";
import { Strum } from "./strum";
import { Token, TokenType } from "./token";

/**
 * Verifies that each bar has the same number of sturms. For tabs allows severl
 * lines.
 */
class StrumsPerBar {
  strumsPerBar = -1;
  bars = -1;
  barCounter = 0;

  constructor(readonly name: string) {}

  endBar(strums: number): void {
    this.barCounter++;
    if (this.strumsPerBar < 0) {
      this.strumsPerBar = strums;
    } else if (this.barCounter * this.strumsPerBar !== strums) {
      throw new Error(
        "The pattern does have the same number of strums in each bar: " +
          `expected: ${this.strumsPerBar}, got: ${strums / this.barCounter}\n` +
          this.name
      );
    }
  }

  endLine(strums: number): void {
    if (this.barCounter * this.strumsPerBar !== strums) {
      // We have to close the last bar.
      this.endBar(strums);
    }
    if (this.bars < 0) {
      this.bars = this.barCounter;
    } else if (this.bars !== this.barCounter) {
      throw new Error(
        "Inconsistent number of bars in each line: " +
          `expected: ${this.bars}, got: ${this.barCounter}\n${this.name}`
      );
    }
    this.barCounter = 0;
  }
}

function getPattern(
  key: string,
  patterns: Map<string, Pattern>,
  time: TimeSignature
): Pattern {
  const pattern = patterns.get(key);
  if (!pattern) {
    throw new Error(`Unknown pattern name "${key}".`);
  }
  if (!pattern.time.equals(time)) {
    throw new Error(
      "Cannot load pattern with mismatching time signature: " +
        `${time.toString()} vs. ${pattern.time.toString()}`
    );
  }
  return pattern;
}

function setPattern(
  key: string,
  pattern: Pattern,
  patterns?: Map<string, Pattern>
): void {
  if (key && patterns) {
    if (patterns.has(key)) {
      throw new Error(`Redefinition of pattern "${key}".`);
    }
    patterns.set(key, pattern);
  }
}

function praseFret(line: string, pos: number, frets: number[]): number {
  if (line[pos] === "-") {
    frets.push(-1);
  } else if (line[pos] >= "0" && line[pos] <= "9") {
    frets.push(parseInt(line[pos]));
  } else if (line[pos] === "(") {
    const end = line.indexOf(")", pos);
    if (end < 0) {
      throw new Error("Missing closing parenthesis");
    }
    const fret = parseInt(line.slice(pos + 1, end));
    if (isNaN(fret)) {
      throw new Error(`Failed to parse fret from ${line.slice(pos + 1, end)}`);
    }
    frets.push(fret);
    return end + 1;
  } else {
    throw new Error(`Invalid character in tab: ${line[pos]}`);
  }
  return pos + 1;
}

/** Represents a strumming pattern over a specified number of bars. */
export class Pattern {
  private constructor(
    readonly time: TimeSignature,
    readonly strums: Strum[],
    readonly bars = 1,
    readonly name = ""
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
    bars = 1,
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
    const strumsPerBar = new StrumsPerBar(pattern);
    while (pos < pattern.length) {
      if (pattern[pos] === "|") {
        // Verify the number of strums per bar is consistent.
        if (pos !== 0) {
          strumsPerBar.endBar(strums.length);
        }
        pos++;
        continue;
      }
      let strum: Strum;
      [strum, pos] = Strum.parse(pattern, pos);
      strums.push(strum);
    }
    strumsPerBar.endLine(strums.length);
    return new Pattern(time, strums, strumsPerBar.bars, name);
  }

  /** Parses a pattern from tab lines. Expects the lowest line first. */
  static parseTab(
    lines: string[],
    time: TimeSignature,
    name?: string
  ): Pattern {
    lines = lines.map((line) => line.replace(/ /g, ""));
    const strumsPerBar = new StrumsPerBar(lines.join("\n"));
    const stringFrets = new Array<Array<number>>();
    for (const line of lines) {
      const frets = new Array<number>();
      let pos = 0;
      while (pos < line.length) {
        if (line[pos] === "|") {
          if (pos !== 0) {
            strumsPerBar.endBar(frets.length);
          }
          pos++;
          continue;
        }
        pos = praseFret(line, pos, frets);
      }
      strumsPerBar.endLine(frets.length);
      stringFrets.push(frets);
    }
    const strums = [];
    for (let i = 0; i < stringFrets[0].length; i++) {
      strums.push(Strum.tab(stringFrets.map((frets) => frets[i])));
    }
    return new Pattern(time, strums, strumsPerBar.bars, name);
  }

  /** Parses a pattern from a Pattern or Tab token. */
  // TODO: Remove `patterns` argument once it's no longer in use. The pattern
  //       maps are handled through the InstrumentLib in future.
  static fromToken(
    token: Token,
    time: TimeSignature,
    patterns?: Map<string, Pattern>
  ): Pattern {
    if (token.type === TokenType.Pattern) {
      if (!token.value && patterns) {
        return getPattern(token.key, patterns, time);
      }
      const pattern = Pattern.parse(token.value, time, token.key);
      setPattern(token.key, pattern, patterns);
      return pattern;
    }
    if (token.type === TokenType.TabEnv) {
      const lines = token.children.map((line) => line.value).reverse();
      const pattern = Pattern.parseTab(lines, time, token.value);
      setPattern(token.value, pattern, patterns);
      return pattern;
    }
    throw token.error("expected pattern or tab token");
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

  /** Returns the requested strum. Works for all integers. */
  getStrum(i: number, bar: number = 0): Strum {
    let idx = (bar * this.strumsPerBar + i) % this.strums.length;
    if (idx < 0) idx += this.strums.length;
    return this.strums[idx];
  }

  /**
   * Whether a tab should be used to display the pattern, i.e., the patern uses
   * string sets.
   */
  useTab(): boolean {
    return this.strums.some((s) => s.strings.length || s.frets.length);
  }

  /**
   * Whether this is considered a main pattern, i.e., it's a named pattern not
   * starting with a "*".
   */
  isMainPattern(): boolean {
    return !!this.name && !this.name.startsWith("*");
  }

  /**
   * Returns the string representation of the pattern, e.g., |d-du-udu|. The
   * string selection is required for tabs.
   */
  toString(string?: number): string {
    if (this.bars === 0) return "";
    return (
      this.strums
        .map(
          (s, i) =>
            (i % this.strumsPerBar === 0 ? "|" : "") + s.toString(string)
        )
        .join("") + "|"
    );
  }

  /** Returns the pattern as token. */
  toToken(): Token {
    return new Token(TokenType.Pattern, this.name, this.toString());
  }
}
