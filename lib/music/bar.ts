import { Chord } from "./chord";
import { parseBeats, sumBeats } from "./note";
import { Pattern } from "./pattern";
import { assert } from "../util";
import { TimeSignature } from "./signature";

export class Bar {
  private highlightInternal = false;
  private highlightListener?: (highlight: boolean) => void;

  constructor(
    public chords: (Chord | null)[],
    public beats: number[],
    public patterns: Pattern[],
    public patternIdxs: number[],
    public lyrics: string[] = [],
    public anacrusis: string = ""
  ) {
    assert(
      this.patterns.length === this.patternIdxs.length,
      `Number of patterns ${patterns.length} must match number indexes` +
        patternIdxs.length
    );
    if (this.lyrics.every((l) => !l)) {
      this.lyrics = [];
    }
  }

  set highlight(highlight: boolean) {
    if (this.highlightInternal !== highlight && this.highlightListener) {
      this.highlightInternal = highlight;
      this.highlightListener(highlight);
    }
  }

  onHighlightChange(listener: (highlight: boolean) => void): void {
    this.highlightListener = listener;
  }

  /** Returns the chord for the i-th strum. */
  getChordForStrum(strumIdx: number, instrumentIdx = 0): Chord | null {
    let beatValue =
      ((strumIdx + 1) * this.patterns[instrumentIdx].time.beats) /
      this.patterns[instrumentIdx].strumsPerBar;
    for (let i = 0; i < this.beats.length; i++) {
      beatValue -= this.beats[i];
      if (beatValue <= Number.EPSILON) {
        return this.chords[i];
      }
    }
    return null;
  }
}

export class BarParagraph {
  constructor(readonly bars: Bar[]) {}

  /** Returns whether to use a tab notation for this paragraph. */
  useTab(instrumentIdx = 0): boolean {
    return this.bars.some((bar) => bar.patterns[instrumentIdx].useTab());
  }

  /** Returns the number of ticks per bar. */
  get ticksPerBar(): number {
    return this.bars[0]?.patterns[0].ticksPerBar ?? NaN;
  }

  /** Returns the number of ticks for the entire paragraph. */
  get ticks(): number {
    return this.ticksPerBar * this.bars.length;
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
}

export class BarParagraphBuilder {
  private paragraphs = new Array<BarParagraph>();
  private bars = new Array<Bar>();
  private beats = new Array<number>();
  private patternIdxs: number[];
  private chords = new Array<Chord | null>();
  private lyrics = new Array<string>();
  private anacrusis: string = "";

  constructor(private patterns: Pattern[], private time: TimeSignature) {
    this.patternIdxs = new Array(patterns.length).fill(0);
  }

  addLyrics(value: string): void {
    if (!value.trim()) return;
    if (value.match(/\w$/)) {
      value += "-";
    }
    value = value.trimRight();

    if (!this.chords.length) {
      // Handle anacrusis.
      assert(!this.anacrusis, "Got 2 lyrics passages before the first chord.");
      this.anacrusis = value;
    } else {
      this.lyrics.push(value);
      assert(
        this.chords.length === this.lyrics.length,
        "Expected chrods to equal the number of lyrics pieces."
      );
    }
  }

  addChord(value: string): void {
    assert(this.patterns.length, "Expected patterns to be set");
    this.closeFullChord();
    const chord = Chord.parse(value);
    const beat = parseBeats(value, this.time.beats);
    if (this.chords.length > this.lyrics.length) {
      this.lyrics.push("");
    }
    this.beats.push(beat);
    this.chords.push(chord);
  }

  newLine(): void {
    while (this.chords.length > this.lyrics.length) {
      this.lyrics.push("");
    }
    if (this.lyrics[this.lyrics.length - 1]?.slice(-1) === "-") {
      // Remove a dash that was added to the last lyrics element because it was
      // probably a mistake.
      this.lyrics[this.lyrics.length - 1] = this.lyrics[
        this.lyrics.length - 1
      ].slice(0, -1);
    }
    assert(this.closeFullChord(), "Beats in line don't add up to full bars.");
  }

  newParagraph(): void {
    this.newLine();
    this.patternIdxs.fill(0);
    if (this.bars.length) {
      this.paragraphs.push(new BarParagraph(this.bars));
      this.bars = [];
    }
  }

  switchPattern(patterns: Pattern[]): void {
    assert(
      this.closeFullChord(),
      "Cannot switch pattern in the middle of a bar."
    );
    if (this.patterns.length === 0) {
      this.patterns = [...patterns];
      this.patternIdxs = new Array(patterns.length).fill(0);
      return;
    }
    assert(
      this.patterns.length === patterns.length,
      "Cannot change number of instruments in the middle of a paragraph"
    );
    for (let i = 0; i < patterns.length; i++) {
      if (patterns[i] === this.patterns[i]) continue;
      this.patterns[i] = patterns[i];
      this.patternIdxs[i] = 0;
    }
  }

  build(): BarParagraph[] | null {
    this.newParagraph();
    if (this.paragraphs.length) {
      return this.paragraphs;
    }
    return null;
  }

  private closeFullChord(): boolean {
    const sum = sumBeats(this.beats);
    if (sum === 0) return true;
    assert(this.patterns.length, "Expected patterns to be set");
    if (sum < this.time.beats) return false;
    assert(
      sum === this.time.beats,
      `Beats add up to more than one bar: ${sum}`
    );
    this.bars.push(
      new Bar(
        this.chords,
        this.beats,
        [...this.patterns],
        [...this.patternIdxs],
        this.lyrics,
        this.anacrusis
      )
    );
    this.chords = [];
    this.beats = [];
    this.patternIdxs = this.patternIdxs.map((idx) => idx + 1);
    this.lyrics = [];
    this.anacrusis = "";
    return true;
  }
}
