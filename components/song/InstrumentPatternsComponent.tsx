import React from "react";
import { Column, Columns, Title } from "bloomer";
import PatternWithCountComponent from "./PatternWithCountComponent";
import { Instrument } from "../../lib/music";
import { Typography } from "@mui/material";

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
      <Typography variant="h4" mb={1}>
        Patterns
      </Typography>
      <Columns isMultiline isMobile style={{ width: "100%", overflow: "auto" }}>
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
