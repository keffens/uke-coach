import React from "react";
import BarParagraphComponent from "./BarParagraphComponent";
import { InstrumentLib, SongPart } from "../../lib/music";
import { Box, Typography } from "@mui/material";
import { BarsPerLine } from "../elements/BarsPerLineSelect";

export interface SongPartComponentProps {
  part: SongPart;
  instrumentLib: InstrumentLib;
  maxBarsPerLine: BarsPerLine;
}

export default function SongPartComponent({
  part,
  instrumentLib,
  maxBarsPerLine,
}: SongPartComponentProps) {
  return (
    <>
      {part.header ? (
        <Typography variant="h4" mt={2} mb={1}>
          {part.header}
        </Typography>
      ) : (
        <Box mt={2} />
      )}
      {part.paragraphs.map((paragraph, i) => (
        <BarParagraphComponent
          key={i}
          paragraph={paragraph}
          instrumentLib={instrumentLib}
          maxBarsPerLine={maxBarsPerLine}
        />
      ))}
    </>
  );
}
