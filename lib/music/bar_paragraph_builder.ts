import { assert } from "../util";
import { Bar } from "./bar";
import { BarParagraph } from "./bar_paragraph";
import { Chord } from "./chord";
import { parseBeats, sumBeats } from "./note";
import { Pattern } from "./pattern";
import { TimeSignature } from "./signature";

export class BarParagraphBuilder {
  private paragraphs = new Array<BarParagraph>();
  private bars = new Array<Bar>();
  private beats = new Array<number>();
  private patternIdxs: number[];
  private chords = new Array<Chord | null>();
  private lyrics = new Array<string>();
  private anacrusis: string = "";
  private activeChord: Chord | null = null;
  private chordBeforeParagraph: Chord | null = null;

  constructor(private patterns: Pattern[], private time: TimeSignature) {
    this.patternIdxs = new Array(patterns.length).fill(0);
  }

  addLyrics(value: string): void {
    if (!value.trim()) return;
    if (value.match(/\w$/)) {
      value += "-";
    }
    value = value.trimEnd();

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
    this.activeChord = chord ?? this.activeChord;
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
        this.anacrusis,
        this.chordBeforeParagraph
      )
    );
    this.chords = [];
    this.beats = [];
    this.patternIdxs = this.patternIdxs.map((idx) => idx + 1);
    this.lyrics = [];
    this.anacrusis = "";
    this.chordBeforeParagraph = this.activeChord;
    return true;
  }
}
