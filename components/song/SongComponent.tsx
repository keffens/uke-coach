import React, { useState } from "react";
import InstrumentsComponent from "./InstrumentsComponent";
import PlayerComponent from "./PlayerComponent";
import SongMetadataComponent from "./SongMetadataComponent";
import SongPartComponent from "./SongPartComponent";
import { Song } from "../../lib/music";
import { BarsPerLine } from "../elements/BarsPerLineSelect";
import { Box } from "@mui/material";

export interface SongComponentProps {
  song: Song;
}

export default function SongComponent({ song }: SongComponentProps) {
  const [update, forceUpdate] = useState(0);
  const [maxBarsPerLine, setMaxBarsPerLine] = useState<BarsPerLine>(8);
  const maxWidth = `${maxBarsPerLine * song.maxStrumsPerBar * 32}px`;
  return (
    <>
      <SongMetadataComponent metadata={song.metadata} />
      <InstrumentsComponent
        instrumentLib={song.instrumentLib}
        onVisibilityChange={() => {
          forceUpdate(update + 1);
        }}
        songKey={song.metadata.key?.note}
      />
      <PlayerComponent song={song} onChangeBarsPerLine={setMaxBarsPerLine} />
      <Box maxWidth={maxWidth} margin="auto">
        {song.parts.map((part, i) => (
          <SongPartComponent
            key={i}
            part={part}
            instrumentLib={song.instrumentLib}
            maxBarsPerLine={maxBarsPerLine}
          />
        ))}
      </Box>
    </>
  );
}
