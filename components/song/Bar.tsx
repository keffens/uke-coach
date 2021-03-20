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

  Render = () => (
    <div className={styles.barContainer}>
      <div className={styles.flexRow}>
        {this._chords.map((chord, i) => (
          <chord.Render key={`chord-${i}`} />
        ))}
      </div>
      <this._pattern.Render bar={this._patternIdx} />
      <Lyrics lyrics={this._lyrics} />
    </div>
  );
}
