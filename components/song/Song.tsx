import React from "react";
import { Content, Title, Subtitle } from "bloomer";
import { Song } from "../../lib/music";
import { SongMetadataComponent } from "./SongMetadata";

export interface SongComponentProps {
  song: Song;
}

export function SongComponent({ song }: SongComponentProps) {
  return (
    <Content>
      <SongMetadataComponent metadata={song.metadata} />
    </Content>
  );
}
