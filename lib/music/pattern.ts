import { assert } from "../util";
import { TICKS_PER_BEAT } from "./note";
import { TimeSignature } from "./signature";
import { Strum, StrumType } from "./strum";
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

/** Returns a pattern's string representation if present. */
export function getPatternString(token: Token): string | null {
  return token.value.split("@", 2)[0]?.trim() || null;
}

/** Returns a pattern's instrument annotation if present. */
export function getPatternInstrumentAnnotation(token: Token): string | null {
  return token.value.split("@", 2)[1]?.trim() || null;
}

/** Represents a strumming pattern over a specified number of bars. */
export class Pattern {
  private constructor(
    readonly time: TimeSignature,
    readonly strums: ReadonlyArray<Strum>,
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
  static fromToken(token: Token, time: TimeSignature): Pattern {
    try {
      if (token.type === TokenType.Pattern) {
        const value = getPatternString(token);
        assert(value, "Expected the token to have a pattern value.");
        return Pattern.parse(value, time, token.key);
      }
      if (token.type === TokenType.TabEnv) {
        const lines = token.children.map((line) => line.value).reverse();
        return Pattern.parseTab(lines, time, token.value);
      }
    } catch (e) {
      if (e instanceof Error) throw token.error(e.message);
      throw e;
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

  /** Returns the note value of a single strum. */
  get strumNoteLength(): number {
    return 1 / (this.strumsPerBeat * this.time.noteValue);
  }

  /** Returns a copy of this pattern. */
  clone(name?: string): Pattern {
    return new Pattern(this.time, this.strums, this.bars, name ?? this.name);
  }

  /** Returns the requested strum. Works for all integers. */
  getStrum(i: number, bar: number = 0): Strum {
    let idx = (bar * this.strumsPerBar + i) % this.strums.length;
    if (idx < 0) idx += this.strums.length;
    return this.strums[idx];
  }

  /**
   * Returns the number of strums that the requested strum holds, i.e.,  1 + the
   * number of pauses following the strum in the same bar. Returns 0 if the
   * strum is a pause.
   */
  strumLength(i: number, bar: number = 0): number {
    let start = (bar * this.strumsPerBar + i) % this.strums.length;
    if (start < 0) start += this.strums.length;
    if (this.strums[start].type === StrumType.Pause) return 0;
    let end = start + 1;
    while (
      end % this.strumsPerBar !== 0 &&
      this.strums[end].type === StrumType.Pause
    ) {
      end++;
    }
    return end - start;
  }

  /**
   * Whether a tab should be used to display the pattern, i.e., the patern uses
   * string sets.
   */
  useTab(ignorePlugged = false): boolean {
    if (ignorePlugged) {
      return this.strums.some((s) => s.frets.length);
    }
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
  tokenize(onlyNameIfGiven = false, forInstrument?: string): Token {
    if (this.isTab() && (!onlyNameIfGiven || !this.name)) {
      const size = this.tabSize();
      const lines = new Array(size).fill("");
      for (const [i, s] of this.strums.entries()) {
        padTabLines(lines, i % this.strumsPerBar === 0);
        for (let j = 0; j < size; j++) {
          if (s.frets[j] >= 10) lines[j] += `(${s.frets[j]})`;
          else if (s.frets[j] >= 0) lines[j] += s.frets[j];
          else lines[j] += "-";
        }
      }
      padTabLines(lines, true);

      const children = lines
        .map((l) => new Token(TokenType.TabLine, undefined, l))
        .reverse();
      let token = new Token(TokenType.TabEnv, "tab", this.name, children);
      if (forInstrument) {
        token = new Token(
          TokenType.InstrumentEnv,
          "instrument",
          forInstrument,
          [token]
        );
      }
      return token;
    }

    let vParts = [];
    if (!onlyNameIfGiven || !this.name) vParts.push(this.toString());
    if (forInstrument) vParts.push(`@ ${forInstrument}`);

    return new Token(
      TokenType.Pattern,
      this.name,
      vParts.join(" ") || undefined
    );
  }

  /** Returns true if the tab can be written as a tab and is not all pauses. */
  private isTab(): boolean {
    let hasTab = false;
    for (const s of this.strums) {
      if (s.type === StrumType.Tab) hasTab = true;
      else if (s.type !== StrumType.Pause) return false;
    }
    return hasTab;
  }

  private tabSize(): number {
    let max = -1;
    for (const s of this.strums) {
      if (s.type === StrumType.Tab && s.frets.length > max) {
        max = s.frets.length;
      }
    }
    return max;
  }
}

/** Pads tab lines to have the same length and optionally adds a separator. */
function padTabLines(lines: string[], addSeparator: boolean) {
  const max = Math.max(...lines.map((l) => l.length));
  for (let i = 0; i < lines.length; i++) {
    lines[i] = lines[i].padEnd(max, " ");
    if (addSeparator) lines[i] += "|";
  }
}
