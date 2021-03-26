import { TimeSignature } from "./signature";
import { Strum } from "./strum";

export class Pattern {
  private constructor(
    private _time: TimeSignature,
    private _strums: Strum[],
    private _bars = 1
  ) {
    if (_bars === 0 && _strums.length === 0) return;
    if (_strums.length % _bars !== 0) {
      throw new Error(
        `Cannot create pattern with ${_strums.length} strums and ` +
          `${_bars} bars.`
      );
    }
    if (this.strumsPerBar % _time.beats !== 0) {
      throw new Error(
        `Cannot create pattern with ${this.strumsPerBar} strums and ` +
          `${_time.beats} beats per bar.`
      );
    }
  }

  static makeEmpty(
    time: TimeSignature,
    bars: number = 1,
    strumsPerBar?: number
  ) {
    strumsPerBar = strumsPerBar ?? 2 * time.beats;
    return new Pattern(
      time,
      Array(bars * strumsPerBar).fill(Strum.pause()),
      bars
    );
  }

  static parse(pattern: string, time: TimeSignature) {
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
    return new Pattern(time, strums, bars);
  }

  get bars() {
    return this._bars;
  }

  get time() {
    return this._time;
  }

  get strumsPerBar() {
    return this._strums.length / this._bars;
  }
}
