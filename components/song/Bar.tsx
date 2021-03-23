import React from "react";
import { Chord, Pattern } from ".";
import styles from "./Song.module.scss";

function Lyrics({ lyrics }: { lyrics?: string[] }) {
  if (!lyrics?.length) {
    return <></>;
  }
  return (
    <div
      className={styles.lyricsRow}
      style={{ gridTemplateColumns: "1fr ".repeat(lyrics.length) }}
    >
      {lyrics.map((l, i) => (
        <span className={styles.lyrics} key={`lyrics-${i}`}>
          {l}
        </span>
      ))}
    </div>
  );
}

export class Bar {
  constructor(
    private _chords: Chord[],
    private _pattern: Pattern,
    private _patternIdx = 0,
    private _lyrics?: string[]
  ) {}

  render = () => (
    <div className={styles.barContainer}>
      <div className={styles.flexRow}>
        {this._chords.map((chord, i) => (
          <chord.render key={`chord-${i}`} />
        ))}
      </div>
      <this._pattern.render bar={this._patternIdx} />
      <Lyrics lyrics={this._lyrics} />
    </div>
  );
}

export class BarLine {
  constructor(private _bars: Bar[]) {}

  // Parses one line of music, storing it into bars.
  static parse(line: string, pattern: Pattern, patternIdx = 0): BarLine | null {
    const matches = [...line.matchAll(/(?:^|\[([^\]]*)\])([^*\[\{]*)/g)];
    const bars = new Array<Bar>();
    let chords = new Array<Chord>();
    let lyrics = new Array<string>();
    let beats = 0;
    for (const match of matches) {
      // Add trailing dash for seperated words.
      let text = match[2].replace(/([^\s])$/, "$1-").trim();
      let chord = match[1]?.trim();
      if (!chord && !text) continue;
      if (chord == null) {
        // Prelude
        bars.push(
          new Bar([Chord.makeEmpty()], Pattern.makeEmpty(0), 0, [text])
        );
        continue;
      }
      lyrics.push(text);
      beats += chord.match(/\.*$/)[0].length || pattern.beatsPerBar;
      chords.push(Chord.parse(chord));
      if (beats === pattern.beatsPerBar) {
        bars.push(new Bar(chords, pattern, patternIdx++, lyrics));
        chords = [];
        lyrics = [];
        beats = 0;
      } else if (beats > pattern.beatsPerBar) {
        throw new Error(`Beats in line "${line}" don't add up to full bars.`);
      }
    }
    if (beats !== 0) {
      throw new Error(`Beats in line "${line}" don't add up to full bars.`);
    }

    if (bars.length) {
      return new BarLine(bars);
    }
    return null;
  }

  render = () => (
    <div className={styles.barLine}>
      {this._bars.map((bar, i) => (
        <bar.render key={`bar-${i}`} />
      ))}
    </div>
  );
}
