import React from "react";
import { Column, Columns, Content, Title } from "bloomer";
import SongMetadataComponent from "./SongMetadataComponent";
import SongPartComponent from "./SongPartComponent";
import PatternWithCountComponent from "./PatternWithCountComponent";
import { Song } from "../../lib/music";

export interface SongComponentProps {
  song: Song;
}

export default function SongComponent({ song }: SongComponentProps) {
  return (
    <Content>
      <SongMetadataComponent metadata={song.metadata} />
      <Title tag="h3">Strumming patterns</Title>
      <Columns isMultiline isMobile>
        {[...song.patterns.keys()].map((name, i) => (
          <Column key={i} style={{ minWidth: "max-content" }}>
            <PatternWithCountComponent
              key={name}
              name={name}
              pattern={song.patterns.get(name)}
            />
          </Column>
        ))}
      </Columns>
      <Title tag="h3">Song</Title>
      {song.parts.map((part, i) => (
        <SongPartComponent key={i} part={part} />
      ))}
    </Content>
  );
}
