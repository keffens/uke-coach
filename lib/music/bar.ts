import { Chord } from "./chord";
import { beatsToString } from "./note";
import { Pattern } from "./pattern";
import { assert } from "../util";
import { TimeSignature } from "./signature";
import { Token, TokenType } from "./token";

function tokenizeLyric(lyric: string, isLastInLine = false): Token {
  if (lyric.endsWith("-")) {
    lyric = lyric.slice(0, -1);
  } else if (!isLastInLine) {
    lyric += " ";
  }
  return new Token(TokenType.Text, undefined, lyric);
}

export class Bar {
  private highlightListener?: (highlight: boolean) => void;

  readonly time: TimeSignature;

  constructor(
    public chords: (Chord | null)[],
    public beats: number[],
    public patterns: Pattern[],
    public patternIdxs: number[],
    public lyrics: string[] = [],
    public anacrusis: string = "",
    public previousChord: Chord | null = null
  ) {
    assert(this.patterns.length >= 1, "The patterns for the bar are empty");
    assert(
      this.patterns.length === this.patternIdxs.length,
      `Number of patterns ${patterns.length} must match number indexes` +
        patternIdxs.length
    );
    this.time = patterns[0].time;
    assert(
      this.chords.length === this.beats.length,
      `Number of chords ${chords.length} must match number of beats ` +
        `${beats.length}`
    );

    if (this.lyrics.every((l) => !l)) {
      this.lyrics = [];
      return;
    }
  }

  set highlight(highlight: boolean) {
    if (this.highlightListener) {
      this.highlightListener(highlight);
    }
  }

  /** Returns the number of rows or instruments. */
  get height(): number {
    return this.patterns.length;
  }

  onHighlightChange(listener: (highlight: boolean) => void): void {
    this.highlightListener = listener;
  }

  /** Returns the chord for the i-th strum. */
  getChordForStrum(strumIdx: number, instrumentIdx = 0): Chord | null {
    let beatValue =
      ((strumIdx + 1) * this.patterns[instrumentIdx].time.beats) /
      this.patterns[instrumentIdx].strumsPerBar;
    let activeChord = this.previousChord;
    for (let i = 0; i < this.beats.length; i++) {
      beatValue -= this.beats[i];
      activeChord = this.chords[i] ?? activeChord;
      if (beatValue <= Number.EPSILON) {
        return activeChord;
      }
    }
    return null;
  }

  /** Tokenizes this bar's chords and lyrics about patterns. */
  tokenizeChordsAndLyrics(isLastInLine = false): Token[] {
    const tokens = [];
    if (this.anacrusis) {
      tokens.push(tokenizeLyric(this.anacrusis));
    }
    for (let i = 0; i < this.chords.length; i++) {
      const chord =
        (this.chords[i]?.toString() ?? "") +
        beatsToString(this.beats[i], this.time.beats);
      tokens.push(new Token(TokenType.Chord, undefined, chord || "_"));

      if (this.lyrics[i])
        tokens.push(
          tokenizeLyric(
            this.lyrics[i],
            isLastInLine && i === this.chords.length - 1
          )
        );
    }
    return tokens;
  }
}
