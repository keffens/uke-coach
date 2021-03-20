import Strum from "./Strum";
import styles from "./Song.module.scss";

export default class Pattern {
  constructor(
    private _strums: Strum[],
    private _beatsPerBar = 4,
    private _bars = 1
  ) {
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

  static fromString(pattern: string, beatsPerBar: number = 4) {
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
      [strum, pos] = Strum.parseStrum(pattern, pos);
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

  render() {
    return (
      <div className={styles.pattern}>
        {this._strums.map((s, i) => {
          if (i % this.strumsPerBar === 0) {
            return (
              <>
                <span className={styles.barSeperator} />
                {s.render()}
              </>
            );
          } else {
            return s.render();
          }
        })}
        <span className={styles.barSeperator} />
      </div>
    );
  }

  renderWithBeats() {
    const beats = new Array();
    for (let i = 0; i < this.beatsPerBar * this.bars; i++) {
      beats.push((i % this.beatsPerBar) + 1);
    }
    return (
      <div className={styles.barContainer}>
        <div className={styles.beatCount}>
          {beats.map((b) => (
            <span>{b}</span>
          ))}
        </div>
        {this.render()}
      </div>
    );
  }
}
