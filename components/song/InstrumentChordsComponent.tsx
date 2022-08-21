import React from "react";
import { ChordLib } from "../../lib/music";
import ChordFrets from "./ChordFrets";
import { Grid, Typography } from "@mui/material";

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
      <Typography variant="h4">Chords</Typography>
      <Grid container mb={2}>
        {chords.map((chord) => (
          <Grid key={chord} item xs px={1}>
            <ChordFrets
              chord={chord}
              chordLib={chordLib}
              style={{ margin: "auto" }}
            />
          </Grid>
        ))}
      </Grid>
    </>
  );
}
