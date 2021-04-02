import React from "react";
import styles from "./Song.module.scss";
import SpacedGridRow from "./SpacedGridRow";

interface LyricsCellComponentProps {
  lyric?: string;
  nextAnacrusis?: string;
}

function LyricsCellComponent({
  lyric,
  nextAnacrusis,
}: LyricsCellComponentProps) {
  if (!lyric && !nextAnacrusis) return <></>;
  if (lyric && !nextAnacrusis) {
    return (
      <div className={styles.lyrics}>
        <div
          className={`${styles.streched} ${
            lyric.slice(-1) === "-" ? "" : "pr-2"
          } ${lyric[0] === " " ? "pl-5" : ""}`}
        >
          {lyric}
        </div>
      </div>
    );
  }
  return (
    <div className={styles.lyrics}>
      {lyric ? <div className={styles.left}>{lyric}</div> : <></>}
      <div
        className={`${styles.right} ${
          nextAnacrusis.slice(-1) === "-" ? "" : "pr-2"
        }`}
      >
        {nextAnacrusis}
      </div>
    </div>
  );
}

interface LyricsComponentProps {
  lyrics: string[];
  beats: number[];
  nextAnacrusis?: string;
}

export default function LyricsComponent({
  lyrics,
  beats,
  nextAnacrusis,
}: LyricsComponentProps) {
  if (!lyrics?.length) {
    if (!nextAnacrusis) {
      return <></>;
    }
    return (
      <div className={styles.lyricsRow}>
        <LyricsCellComponent nextAnacrusis={nextAnacrusis} />
      </div>
    );
  }
  return (
    <SpacedGridRow spacing={beats}>
      {lyrics.map((l, i) => (
        <LyricsCellComponent
          key={i}
          lyric={l}
          nextAnacrusis={i + 1 === lyrics.length ? nextAnacrusis : undefined}
        />
      ))}
    </SpacedGridRow>
  );
}
