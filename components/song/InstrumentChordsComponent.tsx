import React from "react";
import { Column, Columns, Title } from "bloomer";
import { ChordLib } from "../../lib/music";
import ChordFrets from "./ChordFrets";

export interface InstrumentChordsComponentProps {
  chordLib: ChordLib;
}

export default function InstrumentChordsComponent({
  chordLib,
}: InstrumentChordsComponentProps) {
  const chords = [...chordLib.usedChords];
  if (!chords.length) return null;
  return (
    <>
      <Title tag="h4" className="mb-2">
        Chords
      </Title>
      <Columns isMultiline isMobile>
        {chords.map((chord) => (
          <Column key={chord} style={{ minWidth: "max-content" }}>
            <ChordFrets
              chord={chord}
              chordLib={chordLib}
              style={{ margin: "auto" }}
            />
          </Column>
        ))}
      </Columns>
    </>
  );
}
