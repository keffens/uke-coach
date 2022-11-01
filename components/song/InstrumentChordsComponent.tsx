import React, { useState } from "react";
import { Chord, ChordLib, Note, noteCompare } from "../../lib/music";
import ChordFrets from "./ChordFrets";
import { Grid, Typography } from "@mui/material";
import ToggleIcon from "../elements/ToggleIcon";
import { SortByAlphaRounded } from "@mui/icons-material";

export interface InstrumentChordsComponentProps {
  chordLib: ChordLib;
  songKey?: Note;
}

export default function InstrumentChordsComponent({
  chordLib,
  songKey,
}: InstrumentChordsComponentProps) {
  const chords = [...chordLib.usedChords].map((c) => Chord.parse(c)!);
  const [sortAlpha, setSortAlpha] = useState(chords.length >= 6);
  if (sortAlpha) {
    chords.sort((lhs, rhs) => {
      return (
        noteCompare(lhs.root, rhs.root, songKey) ||
        lhs.qualifier.localeCompare(rhs.qualifier) ||
        lhs.extension.localeCompare(rhs.extension)
      );
    });
  }
  if (!chords.length) return null;
  return (
    <>
      <Typography variant="h4">
        Chords{" "}
        <ToggleIcon
          initialState={sortAlpha}
          onClick={() => setSortAlpha(!sortAlpha)}
          sx={{ verticalAlign: "sub" }}
        >
          <SortByAlphaRounded />
        </ToggleIcon>
      </Typography>
      <Grid container mb={2}>
        {chords.map((chord) => (
          <Grid key={chord.toString()} item xs px={1}>
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
