import React from "react";
import styles from "./Lyrics.module.scss";
import SpacedGridRow from "../elements/SpacedGridRow";
import { Box } from "@mui/material";

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
        <Box className={styles.streched} pl={lyric[0] === " " ? 4 : 0}>
          {lyric}
          {lyric.slice(-1) === "-" ? null : <> &zwnj;</>}
        </Box>
      </div>
    );
  }
  return (
    <div className={styles.lyrics}>
      {lyric ? (
        <Box className={styles.left} pl={lyric[0] === " " ? 4 : 0}>
          {lyric}
        </Box>
      ) : null}
      <Box
        className={styles.right}
        pr={nextAnacrusis.slice(-1) === "-" ? 0 : 1}
        ml={isSoloAnacrusis ? 0 : 4}
      >
        {nextAnacrusis}
      </Box>
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
