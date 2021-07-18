import React, { useRef, useEffect, useState } from "react";
import { Columns } from "bloomer";
import SpacedGridRow from "../elements/SpacedGridRow";
import ChordComponent from "./ChordComponent";
import LyricsComponent from "./LyricsComponent";
import PatternComponent from "./PatternComponent";
import { Bar, BarParagraph, InstrumentLib } from "../../lib/music";
import styles from "./BarParagraph.module.scss";
import { range } from "../../lib/util";
import { Player } from "../../lib/player";

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
  const [highlightState, setHighlight] = useState(false);
  const highlightClass = highlightState ? styles.highlight : "";

  bar.onHighlightChange((highlight) => {
    if (highlightState !== highlight) {
      setHighlight(highlight);
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
      <div ref={barRef} className={styles.firstBarContainer}>
        <LyricsComponent
          lyrics={[]}
          beats={[]}
          nextAnacrusis={bar.anacrusis}
          isSoloAnacrusis
        />
        <div
          className={`${styles.barContainer} ${highlightClass}`}
          style={{ minWidth: "unset" }}
        >
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
            />
          ))}
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
    <div ref={barRef} className={`${styles.barContainer} ${highlightClass}`}>
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
        />
      ))}
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
  instrumentLib: InstrumentLib;
}

export default function BarParagraphComponent({
  paragraph,
  instrumentLib,
}: BarParagraphComponentProps) {
  const useTab = range(instrumentLib.length).map((i) => paragraph.useTab(i));
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
        />
      ))}
    </Columns>
  );
}
