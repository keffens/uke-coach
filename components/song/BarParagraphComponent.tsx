import React, { useRef, useEffect, useState } from "react";
import SpacedGridRow from "../elements/SpacedGridRow";
import ChordComponent from "./ChordComponent";
import LyricsComponent from "./LyricsComponent";
import PatternComponent from "./PatternComponent";
import { Bar, BarParagraph, InstrumentLib, sumBeats } from "../../lib/music";
import { range } from "../../lib/util";
import { Player } from "../../lib/player";
import { Box, Grid, useTheme } from "@mui/material";

// TODO: Fiddle a bit with these values.
const MAX_STRUMS_PER_ROW = {
  xs: 16,
  sm: 24,
  md: 32,
  lg: 48,
  xl: 64,
};

// For each key, percentages are chosen such that key+1 columns won't fit.
const FLEX_BASE_MAP = {
  0: "100%", // The minimum is 1 column.
  2: "35%",
  3: "26%",
  4: "21%",
  6: "14.5%",
  8: "11.5%",
  12: "8%",
  16: "6%",
};

const MIN_SPACER_WIDTH_MAP = {
  0: "100%", // The minimum is 1 column.
  2: "50%",
  3: "33.3%",
  4: "25%",
  6: "16.6%",
  8: "12.5%",
  12: "8.3%",
  16: "6.25%",
};

/**
 * Returns a mapping from MUI break points to sizes. Intended for use with
 * FLEX_BASE and MIN_SPACER_WIDTH.
 */
function makeSizeMapping<T>(
  maxStrumsPerBar: number,
  map: { [key: number]: string }
): { [key: string]: string } {
  const result: { [key: string]: string } = {};
  for (const [bp, spr] of Object.entries(MAX_STRUMS_PER_ROW)) {
    const cols = spr / maxStrumsPerBar;
    for (const c of [16, 12, 8, 6, 4, 3, 2, 0]) {
      if (c <= cols) {
        result[bp] = map[c];
        break;
      }
    }
  }
  return result;
}

interface ChordRowProps {
  bar: Bar;
  highlight: number;
}

function ChordRow({ bar, highlight }: ChordRowProps) {
  let beats = bar.beats;
  let chords = bar.chords;
  let highlightPos = -1;
  if (highlight >= 1) {
    beats = [];
    chords = [];
    let beatSum = 1;
    for (let i = 0; i < bar.beats.length; i++) {
      chords.push(bar.chords[i]);
      const newBeatSum = sumBeats([beatSum, bar.beats[i]]);
      if (beatSum < highlight && newBeatSum > highlight) {
        // Split this beat into 2.
        highlightPos = i + 1;
        chords.push(null);
        beats.push(highlight - beatSum);
        beats.push(newBeatSum - highlight);
      } else {
        if (beatSum === highlight) {
          highlightPos = i;
        }
        beats.push(bar.beats[i]);
      }
      beatSum = newBeatSum;
    }
  }
  return (
    <SpacedGridRow spacing={beats}>
      {chords.map((chord, i) => (
        <ChordComponent
          key={i}
          chord={chord}
          highlight={i === highlightPos}
          base={!chord && i === highlightPos ? highlight : null}
        />
      ))}
    </SpacedGridRow>
  );
}

function Highlight() {
  const theme = useTheme();
  return (
    <Box
      bgcolor={theme.palette.primary.light}
      borderRadius={1}
      position="absolute"
      top="-0.2em"
      bottom="-0.2em"
      left="-0.2em"
      right="-0.2em"
      zIndex={-2}
    />
  );
}

interface BarComponentProps {
  bar: Bar;
  isFirst: boolean;
  useTab: boolean[];
  nextAnacrusis?: string;
  instrumentLib: InstrumentLib;
}

function BarComponent({
  bar,
  isFirst,
  useTab,
  nextAnacrusis,
  instrumentLib,
}: BarComponentProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const [highlightState, setHighlightState] = useState(false);
  const [highlightCounter, setHighlightCounter] = useState(0);

  bar.onHighlightChange((highlight) => {
    if (!highlight) {
      setHighlightState(false);
    } else if (Player.isPlaying) {
      setHighlightState(true);
      setHighlightCounter(1);
      for (let i = 1; i < bar.time.beats; i++) {
        setTimeout(() => setHighlightCounter(i + 1), Player.beatDurationMs * i);
      }
      setTimeout(() => setHighlightCounter(0), Player.barDurationMs);
    } else {
      setHighlightState(true);
      setHighlightCounter(0);
    }
  });

  useEffect(() => {
    if (Player.autoScroll && highlightState) {
      barRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    }
  }, [highlightState]);

  if (isFirst && bar.anacrusis) {
    return (
      <Grid container alignItems="flex-end">
        <Grid item xs="auto">
          <LyricsComponent
            lyrics={[]}
            beats={[]}
            nextAnacrusis={bar.anacrusis}
            isSoloAnacrusis
          />
        </Grid>
        <Grid item xs position="relative" ref={barRef}>
          {!!highlightState && <Highlight />}
          <ChordRow
            bar={bar}
            highlight={highlightState ? highlightCounter : 0}
          />
          {range(instrumentLib.length).map((idx) => (
            <PatternComponent
              key={idx}
              bar={bar}
              useTab={useTab[idx]}
              showStringLabels
              instrumentLib={instrumentLib}
              instrumentIdx={idx}
            />
          ))}
          <LyricsComponent
            lyrics={bar.lyrics}
            beats={bar.beats}
            nextAnacrusis={nextAnacrusis}
          />
        </Grid>
      </Grid>
    );
  }
  return (
    <Box position="relative" ref={barRef} height="100%">
      {!!highlightState && <Highlight />}
      <ChordRow bar={bar} highlight={highlightState ? highlightCounter : 0} />
      {range(instrumentLib.length).map((idx) => (
        <PatternComponent
          key={idx}
          bar={bar}
          useTab={useTab[idx]}
          showStringLabels={isFirst}
          instrumentLib={instrumentLib}
          instrumentIdx={idx}
        />
      ))}
      <LyricsComponent
        lyrics={bar.lyrics}
        beats={bar.beats}
        nextAnacrusis={nextAnacrusis}
      />
    </Box>
  );
}

export interface BarParagraphComponentProps {
  paragraph: BarParagraph;
  instrumentLib: InstrumentLib;
}

export default function BarParagraphComponent({
  paragraph,
  instrumentLib,
}: BarParagraphComponentProps) {
  const useTab = range(instrumentLib.length).map((i) => paragraph.useTab(i));
  const maxStrumsPerPar = paragraph.maxStrumsPerBar;
  const flexBase = makeSizeMapping(maxStrumsPerPar, FLEX_BASE_MAP);
  const minSpacerWidth = makeSizeMapping(maxStrumsPerPar, MIN_SPACER_WIDTH_MAP);

  return (
    <Grid container>
      {paragraph.bars.map((bar, i) => (
        <Box key={i} minWidth="max-content" flexGrow={1} flexBasis={flexBase}>
          <BarComponent
            bar={bar}
            isFirst={i === 0}
            useTab={useTab}
            nextAnacrusis={paragraph.bars[i + 1]?.anacrusis}
            instrumentLib={instrumentLib}
          />
        </Box>
      ))}
      {/* Adding empty items, fixes the stretching of the last row. */}
      {range(15).map((i) => (
        <Box
          key={i}
          flexGrow={1}
          flexBasis={flexBase}
          minWidth={minSpacerWidth}
          height={0}
        ></Box>
      ))}
    </Grid>
  );
}
