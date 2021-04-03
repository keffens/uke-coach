import React from "react";
import ChordComponent from "./ChordComponent";
import LyricsComponent from "./LyricsComponent";
import PatternComponent from "./PatternComponent";
import { Bar, BarParagraph, TimeSignature } from "../../lib/music";
import styles from "./Song.module.scss";
import { Pattern } from "../../lib/music/pattern";
import SpacedGridRow from "./SpacedGridRow";

interface BarComponentProps {
  bar: Bar;
  isFirst: boolean;
  useTab: boolean;
  nextAnacrusis?: string;
}

function BarComponent({
  bar,
  isFirst,
  useTab,
  nextAnacrusis,
}: BarComponentProps) {
  if (isFirst && bar.anacrusis) {
    return (
      <div className={styles.firstBarContainer}>
        <div className={styles.barContainer} style={{ flexGrow: 0 }}>
          <ChordComponent />
          <PatternComponent pattern={Pattern.makeEmpty(bar.pattern.time, 0)} />
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
          <PatternComponent
            pattern={bar.pattern}
            bar={bar.patternIdx}
            useTab={useTab}
            showStringLabels
          />
          <LyricsComponent
            lyrics={bar.lyrics}
            beats={bar.beats}
            nextAnacrusis={nextAnacrusis}
          />
        </div>
      </div>
    );
  }
  return (
    <div className={styles.barContainer}>
      <SpacedGridRow spacing={bar.beats}>
        {bar.chords.map((chord, i) => (
          <ChordComponent key={i} chord={chord} />
        ))}
      </SpacedGridRow>
      <PatternComponent
        pattern={bar.pattern}
        bar={bar.patternIdx}
        useTab={useTab}
        showStringLabels={isFirst}
      />
      <LyricsComponent
        lyrics={bar.lyrics}
        beats={bar.beats}
        nextAnacrusis={nextAnacrusis}
      />
    </div>
  );
}

export interface BarParagraphComponentProps {
  paragraph: BarParagraph;
}

export default function BarParagraphComponent({
  paragraph,
}: BarParagraphComponentProps) {
  const useTab = paragraph.useTab();
  return (
    <div className={styles.barParagraph}>
      {paragraph.bars.map((bar, i) => (
        <BarComponent
          key={i}
          bar={bar}
          isFirst={i === 0}
          useTab={useTab}
          nextAnacrusis={paragraph.bars[i + 1]?.anacrusis}
        />
      ))}
    </div>
  );
}
