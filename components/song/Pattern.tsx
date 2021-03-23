import React from "react";
import { Strum } from ".";
import { range } from "../../lib/util";
import styles from "./Song.module.scss";

export class Pattern {
  constructor(
    private _strums: Strum[],
    private _beatsPerBar = 4,
    private _bars = 1
  ) {
    if (_bars === 0 && _strums.length === 0) return;
    if (_strums.length % _bars !== 0) {
      throw new Error(
        `Cannot create pattern with ${_strums.length} strums and ` +
          `${_bars} bars.`
      );
    }
    if (this.strumsPerBar % _beatsPerBar !== 0) {
      throw new Error(
        `Cannot create pattern with ${this.strumsPerBar} strums and ` +
          `${_beatsPerBar} beats per bar.`
      );
    }
  }

  static makeEmpty(
    bars: number = 1,
    beatsPerBar: number = 4,
    strumsPerBar?: number
  ) {
    strumsPerBar = strumsPerBar ?? 2 * beatsPerBar;
    return new Pattern(
      Array(bars * strumsPerBar).fill(Strum.pause()),
      beatsPerBar,
      bars
    );
  }

  static parse(pattern: string, beatsPerBar: number = 4) {
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
    return new Pattern(strums, beatsPerBar, bars);
  }

  get bars() {
    return this._bars;
  }

  get beatsPerBar() {
    return this._beatsPerBar;
  }

  get strumsPerBar() {
    return this._strums.length / this._bars;
  }

  render = ({ bar = 0 }: { bar: number }) => {
    if (this._bars === 0) {
      return <div className={styles.pattern}></div>;
    }
    bar = bar % this.bars;
    const strums = this._strums.slice(
      bar * this.strumsPerBar,
      (bar + 1) * this.strumsPerBar
    );
    return (
      <div className={styles.pattern}>
        <span className={styles.barSeperator} />
        {strums.map((s, i) => (
          <s.render key={`strum-${i}`} />
        ))}
        <span className={styles.barSeperator} />
      </div>
    );
  };

  renderWithCount = () => {
    const beats = range(1, this.beatsPerBar + 1);
    return (
      <>
        {range(this.bars).map((bar) => (
          <div className={styles.barContainer} key={`bar-${bar}`}>
            <div className={styles.beatCount}>
              {beats.map((b, i) => (
                <span key={`beat-${i}`}>{b}</span>
              ))}
            </div>
            <this.render bar={bar} />
          </div>
        ))}
      </>
    );
  };
}
