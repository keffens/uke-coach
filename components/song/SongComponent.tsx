import React, { useState } from "react";
import InstrumentsComponent from "./InstrumentsComponent";
import PlayerComponent from "./PlayerComponent";
import SongMetadataComponent from "./SongMetadataComponent";
import SongPartComponent from "./SongPartComponent";
import { Song } from "../../lib/music";

export interface SongComponentProps {
  song: Song;
}

export default function SongComponent({ song }: SongComponentProps) {
  const [update, forceUpdate] = useState(0);
  return (
    <>
      <SongMetadataComponent metadata={song.metadata} />
      <InstrumentsComponent
        instrumentLib={song.instrumentLib}
        onVisibilityChange={() => {
          forceUpdate(update + 1);
        }}
      />
      <PlayerComponent song={song} />
      {song.parts.map((part, i) => (
        <SongPartComponent
          key={i}
          part={part}
          instrumentLib={song.instrumentLib}
        />
      ))}
    </>
  );
}
