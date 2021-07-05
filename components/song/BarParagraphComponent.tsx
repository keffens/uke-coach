import React from "react";
import { Column, Columns } from "bloomer";
import ChordComponent from "./ChordComponent";
import LyricsComponent from "./LyricsComponent";
import PatternComponent from "./PatternComponent";
import SpacedGridRow from "./SpacedGridRow";
import { Bar, BarParagraph, InstrumentLib, Pattern } from "../../lib/music";
import styles from "./Song.module.scss";
import { range } from "../../lib/util";

interface BarComponentProps {
  bar: Bar;
  isFirst: boolean;
  useTab: boolean[];
  nextAnacrusis?: string;
  instrumentLib: InstrumentLib;
  highlightTick?: number;
}

function BarComponent({
  bar,
  isFirst,
  useTab,
  nextAnacrusis,
  instrumentLib,
  highlightTick,
}: BarComponentProps) {
  if (isFirst && bar.anacrusis) {
    return (
      <Column isPaddingless className={styles.firstBarContainer}>
        <div className={styles.barContainer} style={{ flexGrow: 0 }}>
          <ChordComponent />
          {bar.patterns.map((pattern, idx) => (
            <PatternComponent
              key={idx}
              pattern={Pattern.makeEmpty(pattern.time, 0)}
              instrumentLib={instrumentLib}
              instrumentIdx={idx}
            />
          ))}
          <LyricsComponent
            lyrics={[]}
            beats={[]}
            nextAnacrusis={bar.anacrusis}
            isSoloAnacrusis
          />
        </div>
        <div className={styles.barContainer} style={{ minWidth: "unset" }}>
          <SpacedGridRow spacing={bar.beats}>
            {bar.chords.map((chord, i) => (
              <ChordComponent key={i} chord={chord} />
            ))}
          </SpacedGridRow>
          {range(instrumentLib.length).map((idx) => (
            <PatternComponent
              key={idx}
              bar={bar}
              useTab={useTab[idx]}
              showStringLabels
              instrumentLib={instrumentLib}
              instrumentIdx={idx}
              highlightTick={highlightTick}
            />
          ))}
          <LyricsComponent
            lyrics={bar.lyrics}
            beats={bar.beats}
            nextAnacrusis={nextAnacrusis}
          />
        </div>
      </Column>
    );
  }
  return (
    <Column isPaddingless className={styles.barContainer}>
      <SpacedGridRow spacing={bar.beats}>
        {bar.chords.map((chord, i) => (
          <ChordComponent key={i} chord={chord} />
        ))}
      </SpacedGridRow>
      {range(instrumentLib.length).map((idx) => (
        <PatternComponent
          key={idx}
          bar={bar}
          useTab={useTab[idx]}
          showStringLabels={isFirst}
          instrumentLib={instrumentLib}
          instrumentIdx={idx}
          highlightTick={highlightTick}
        />
      ))}
      <LyricsComponent
        lyrics={bar.lyrics}
        beats={bar.beats}
        nextAnacrusis={nextAnacrusis}
      />
    </Column>
  );
}

export interface BarParagraphComponentProps {
  paragraph: BarParagraph;
  instrumentLib: InstrumentLib;
  highlightTick?: number;
}

export default function BarParagraphComponent({
  paragraph,
  instrumentLib,
  highlightTick,
}: BarParagraphComponentProps) {
  highlightTick = highlightTick ?? NaN;
  const useTab = range(instrumentLib.length).map((i) => paragraph.useTab(i));
  const highlightInBar = Math.floor(highlightTick / paragraph.ticksPerBar);
  const tickInBar = highlightTick % paragraph.ticksPerBar;
  return (
    <Columns isMultiline isMobile isMarginless className={styles.barParagraph}>
      {paragraph.bars.map((bar, i) => (
        <BarComponent
          key={i}
          bar={bar}
          isFirst={i === 0}
          useTab={useTab}
          nextAnacrusis={paragraph.bars[i + 1]?.anacrusis}
          instrumentLib={instrumentLib}
          highlightTick={highlightInBar === i ? tickInBar : NaN}
        />
      ))}
    </Columns>
  );
}
