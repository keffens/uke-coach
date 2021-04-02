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
  nextAnacrusis?: string;
}

function BarComponent({ bar, nextAnacrusis }: BarComponentProps) {
  return (
    <div className={styles.barContainer}>
      <SpacedGridRow spacing={bar.beats}>
        {bar.chords.map((chord, i) => (
          <ChordComponent key={i} chord={chord} />
        ))}
      </SpacedGridRow>
      <PatternComponent pattern={bar.pattern} bar={bar.patternIdx} />
      <LyricsComponent
        lyrics={bar.lyrics}
        beats={bar.beats}
        nextAnacrusis={nextAnacrusis}
      />
    </div>
  );
}

interface AnacrusisCompomentProps {
  anacrusis?: string;
  time?: TimeSignature;
}

function AnacrusisCompoment({ anacrusis, time }: AnacrusisCompomentProps) {
  if (!anacrusis) return <></>;
  const pattern = Pattern.makeEmpty(time, 0);
  return <BarComponent bar={new Bar([null], [], pattern, 0, [anacrusis])} />;
}

export interface BarParagraphComponentProps {
  paragraph: BarParagraph;
}

export default function BarParagraphComponent({
  paragraph,
}: BarParagraphComponentProps) {
  return (
    <div className={styles.barLine}>
      <AnacrusisCompoment
        anacrusis={paragraph.bars[0]?.anacrusis}
        time={paragraph.bars[0]?.pattern.time}
      />
      {paragraph.bars.map((bar, i) => (
        <BarComponent
          key={i}
          bar={bar}
          nextAnacrusis={paragraph.bars[i + 1]?.anacrusis}
        />
      ))}
    </div>
  );
}
