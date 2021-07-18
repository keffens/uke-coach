import React from "react";
import { Column, Columns, Title } from "bloomer";
import PatternWithCountComponent from "./PatternWithCountComponent";
import { Instrument } from "../../lib/music";

export interface InstrumentPatternsComponentProps {
  instrument: Instrument;
}

export default function InstrumentPatternsComponent({
  instrument,
}: InstrumentPatternsComponentProps) {
  const patterns = instrument.getPatterns(/*onlyMain=*/ true);
  if (!patterns.length) return null;
  return (
    <>
      <Title tag="h4" className="mb-2">
        Patterns
      </Title>
      <Columns isMultiline isMobile>
        {patterns.map((pattern, i) => (
          <Column key={i} style={{ minWidth: "max-content" }}>
            <PatternWithCountComponent
              key={i}
              pattern={pattern}
              instrument={instrument}
            />
          </Column>
        ))}
      </Columns>
    </>
  );
}
