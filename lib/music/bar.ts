import { Chord } from "./chord";
import { parseBeats, sumBeats } from "./note";
import { Pattern } from "./pattern";
import { assert } from "../util";

export class Bar {
  constructor(
    public chords: (Chord | null)[],
    public beats: number[],
    public pattern: Pattern,
    public patternIdx = 0,
    public lyrics: string[] = [],
    public anacrusis: string = ""
  ) {
    if (this.lyrics.every((l) => !l)) {
      this.lyrics = [];
    }
  }

  /** Returns the chord for the i-th chord. */
  getChordForStrum(strumIdx: number): Chord | null {
    let beatValue =
      ((strumIdx + 1) * this.pattern.time.beats) / this.pattern.strumsPerBar;
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
  useTab(): boolean {
    return this.bars.some((bar) => bar.pattern.useTab());
  }

  /** Returns the number of ticks per bar. */
  get ticksPerBar(): number {
    return this.bars[0]?.pattern.ticksPerBar ?? NaN;
  }

  /** Returns the number of ticks for the entire paragraph. */
  get ticks(): number {
    return this.ticksPerBar * this.bars.length;
  }
}

export class BarParagraphBuilder {
  private _paragraphs = new Array<BarParagraph>();
  private _bars = new Array<Bar>();
  private _beats = new Array<number>();
  private _patternIdx = 0;
  private _chords = new Array<Chord | null>();
  private _lyrics = new Array<string>();
  private _anacrusis: string = "";

  constructor(private _pattern: Pattern | null = null) {}

  addLyrics(value: string) {
    if (!value.trim()) return;
    if (value.match(/\w$/)) {
      value += "-";
    }
    value = value.trimRight();

    if (!this._chords.length) {
      // Handle anacrusis.
      if (this._anacrusis) {
        throw new Error("Got 2 lyrics passages before the first chord.");
      }
      this._anacrusis = value;
    } else {
      this._lyrics.push(value);
      if (this._chords.length !== this._lyrics.length) {
        throw new Error(
          "Expected chrods to equal the number of lyrics pieces."
        );
      }
    }
  }

  addChord(value: string) {
    assert(this._pattern, "Expected pattern to be set");
    this.closeFullChord();
    const chord = Chord.parse(value);
    const beat = parseBeats(value, this._pattern.time.beats);
    if (this._chords.length > this._lyrics.length) {
      this._lyrics.push("");
    }
    this._beats.push(beat);
    this._chords.push(chord);
  }

  newLine() {
    while (this._chords.length > this._lyrics.length) {
      this._lyrics.push("");
    }
    if (this._lyrics[this._lyrics.length - 1]?.slice(-1) === "-") {
      // Remove a dash that was added to the last lyrics element because it was
      // probably a mistake.
      this._lyrics[this._lyrics.length - 1] = this._lyrics[
        this._lyrics.length - 1
      ].slice(0, -1);
    }
    if (!this.closeFullChord()) {
      throw new Error("Beats in line don't add up to full bars.");
    }
  }

  newParagraph() {
    this.newLine();
    this._patternIdx = 0;
    if (this._bars.length) {
      this._paragraphs.push(new BarParagraph(this._bars));
      this._bars = [];
    }
  }

  switchPattern(pattern: Pattern) {
    if (!this.closeFullChord()) {
      throw new Error("Cannot switch pattern in the middle of a bar.");
    }
    this._pattern = pattern;
    this._patternIdx = 0;
  }

  build() {
    this.newParagraph();
    if (this._paragraphs.length) {
      return this._paragraphs;
    }
    return null;
  }

  private closeFullChord() {
    const sum = sumBeats(this._beats);
    if (sum === 0) return true;
    assert(this._pattern, "Expected pattern to be set");
    if (sum < this._pattern.time.beats) return false;
    if (sum > this._pattern.time.beats) {
      throw new Error(`Beats add up to more than one bar: ${sum}`);
    }
    this._bars.push(
      new Bar(
        this._chords,
        this._beats,
        this._pattern,
        this._patternIdx,
        this._lyrics,
        this._anacrusis
      )
    );
    this._chords = [];
    this._beats = [];
    this._patternIdx++;
    this._lyrics = [];
    this._anacrusis = "";
    return true;
  }
}
