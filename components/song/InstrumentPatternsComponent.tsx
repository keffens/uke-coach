import React from "react";
import PatternWithCountComponent from "./PatternWithCountComponent";
import { Instrument } from "../../lib/music";
import { Box, Grid, Typography } from "@mui/material";

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
      <Box overflow="auto">
        <Grid container rowSpacing={2} columnSpacing={4} pb={1}>
          {patterns.map((pattern, i) => (
            <Grid item key={i} xs="auto" minWidth="max-content">
              <PatternWithCountComponent
                pattern={pattern}
                instrument={instrument}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  );
}
