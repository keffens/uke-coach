import { Bar } from "./bar";
import { InstrumentLib } from "./instrument_lib";
import { Pattern } from "./pattern";
import { Token, TokenType } from "./token";

export class BarParagraph {
  constructor(readonly bars: Bar[]) {}

  /** Returns whether to use a tab notation for this paragraph. */
  useTab(instrumentIdx = 0): boolean {
    return this.bars.some((bar) => bar.patterns[instrumentIdx].useTab());
  }

  /** Returns the maximum number that any pattern has in this bar. */
  get maxStrumsPerBar(): number {
    return Math.max(
      ...this.bars.map((b) =>
        Math.max(...b.patterns.map((p) => p.strumsPerBar))
      )
    );
  }

  /** Returns the number of ticks per bar. */
  get ticksPerBar(): number {
    return this.bars[0]?.patterns[0].ticksPerBar ?? NaN;
  }

  /** Returns the number of ticks for the entire paragraph. */
  get ticks(): number {
    return this.ticksPerBar * this.bars.length;
  }

  /** Returns the number of rows or instruments. */
  get height(): number {
    return this.bars[0].height;
  }

  /** Clears the highlight on all bars. */
  clearHighlight(): void {
    for (const bar of this.bars) {
      bar.highlight = false;
    }
  }

  /**
   * Returns the patterns used in this bar paragraph for the given instrument.
   */
  usedPatterns(instrumentIdx: number): Set<Pattern> {
    const patterns = new Set<Pattern>();
    for (const bar of this.bars) {
      patterns.add(bar.patterns[instrumentIdx]);
    }
    return patterns;
  }

  /** Returns the chords used by the given instrument.*/
  usedChords(instrumentIdx: number): Set<string> {
    const chords = new Set<string>();
    for (const bar of this.bars) {
      const pattern = bar.patterns[instrumentIdx];
      const patternIdx = bar.patternIdxs[instrumentIdx];
      for (let i = 0; i < pattern.strumsPerBar; i++) {
        const chord = bar.getChordForStrum(i, instrumentIdx);
        if (chord && pattern.getStrum(i, patternIdx).usesChord()) {
          chords.add(chord.toString());
        }
      }
    }
    return chords;
  }

  /**
   * Tokenizes this paragraph. Active patterns are being handed from paragraph
   * to paragraph.
   */
  tokenize(
    instrumentLib: InstrumentLib,
    activePatternsInOut: Array<Pattern | null>
  ): Token[] {
    const tokens = [];
    let isFirstInLine = true;
    for (let i = 0; i < this.bars.length; i++) {
      const bar = this.bars[i];

      // Update patterns if they changed.
      // TODO: When using several instruments there are shorter ways to change
      // patterns for several instruments at once if they have the same pattern
      // name.
      for (let i = 0; i < activePatternsInOut.length; i++) {
        if (activePatternsInOut[i] !== bar.patterns[i]) {
          const instrument =
            activePatternsInOut.length >= 2
              ? instrumentLib.instruments[i].name
              : undefined;
          tokens.push(
            bar.patterns[i].tokenize(/*onlyNameIfGiven=*/ true, instrument)
          );
          if (isFirstInLine && tokens.at(-1)?.type === TokenType.Pattern) {
            // Add extra line breaks after patterns at beginning of line. Don't
            // do this for tab environments.
            tokens.push(new Token(TokenType.LineBreak));
          }
          activePatternsInOut[i] = bar.patterns[i];
        }
      }

      const nextBar = this.bars[i + 1];
      const isLastInLine =
        !nextBar ||
        // If this bar ends with a "-", it must not be the last in the line.
        (!bar.lyrics.at(-1)?.endsWith("-") &&
          // Break every 4 bars or before an anacrusis.
          (i % 4 === 3 || !!nextBar.anacrusis));

      tokens.push(...bar.tokenizeChordsAndLyrics(isLastInLine));
      if (isLastInLine) tokens.push(new Token(TokenType.LineBreak));
      isFirstInLine = isLastInLine;
    }
    return tokens;
  }
}
