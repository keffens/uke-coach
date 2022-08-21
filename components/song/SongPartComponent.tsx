import React from "react";
import BarParagraphComponent from "./BarParagraphComponent";
import { InstrumentLib, SongPart } from "../../lib/music";
import { Typography } from "@mui/material";

export interface SongPartComponentProps {
  part: SongPart;
  instrumentLib: InstrumentLib;
}

export default function SongPartComponent({
  part,
  instrumentLib,
}: SongPartComponentProps) {
  return (
    <>
      {part.header ? (
        <Typography variant="h4" mt={2} mb={1}>
          {part.header}
        </Typography>
      ) : (
        <div className="mt-5"></div>
      )}
      {part.paragraphs.map((paragraph, i) => (
        <BarParagraphComponent
          key={i}
          paragraph={paragraph}
          instrumentLib={instrumentLib}
        />
      ))}
    </>
  );
}
