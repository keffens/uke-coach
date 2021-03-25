import React from "react";
import { Content } from "bloomer";
import { Song } from "../../lib/music";
import SongMetadataComponent from "./SongMetadataComponent";
import SongPartComponent from "./SongPartComponent";

export interface SongComponentProps {
  song: Song;
}

export default function SongComponent({ song }: SongComponentProps) {
  return (
    <Content>
      <SongMetadataComponent metadata={song.metadata} />
      {song.parts.map((part, i) => (
        <SongPartComponent key={`part-${i}`} part={part} />
      ))}
    </Content>
  );
}
