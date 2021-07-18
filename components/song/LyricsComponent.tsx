import React from "react";
import styles from "./Lyrics.module.scss";
import SpacedGridRow from "../elements/SpacedGridRow";

interface LyricsCellComponentProps {
  lyric?: string;
  nextAnacrusis?: string;
  isSoloAnacrusis?: boolean;
}

function LyricsCellComponent({
  lyric,
  nextAnacrusis,
  isSoloAnacrusis,
}: LyricsCellComponentProps) {
  nextAnacrusis = nextAnacrusis ?? "";
  if (lyric && isSoloAnacrusis) {
    throw new Error("`isSoloAnacrusis` may only be set if `lyric` is empty.");
  }
  if (!lyric && !nextAnacrusis) return <div />;
  if (lyric && !nextAnacrusis) {
    return (
      <div className={styles.lyrics}>
        <div className={`${styles.streched} ${lyric[0] === " " ? "pl-5" : ""}`}>
          {lyric}
          {lyric.slice(-1) === "-" ? null : <> &zwnj;</>}
        </div>
      </div>
    );
  }
  return (
    <div className={styles.lyrics}>
      {lyric ? (
        <div className={styles.left + ` ${lyric[0] === " " ? "pl-5" : ""}`}>
          {lyric}
        </div>
      ) : null}
      <div
        className={
          styles.right +
          ` ${nextAnacrusis.slice(-1) === "-" ? "" : "pr-1"}` +
          ` ${isSoloAnacrusis ? "" : "ml-3"}`
        }
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
  isSoloAnacrusis?: boolean;
}

export default function LyricsComponent({
  lyrics,
  beats,
  nextAnacrusis,
  isSoloAnacrusis,
}: LyricsComponentProps) {
  if (!lyrics?.length) {
    if (!nextAnacrusis) {
      return null;
    }
    return (
      <LyricsCellComponent
        nextAnacrusis={nextAnacrusis}
        isSoloAnacrusis={isSoloAnacrusis}
      />
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
