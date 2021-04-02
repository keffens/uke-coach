import { Title } from "bloomer";
import { Content } from "bloomer";
import { Song } from "../../lib/music";
import SongMetadataComponent from "./SongMetadataComponent";
import SongPartComponent from "./SongPartComponent";
import PatternWithCountComponent from "./PatternWithCountComponent";

export interface SongComponentProps {
  song: Song;
}

export default function SongComponent({ song }: SongComponentProps) {
  return (
    <Content>
      <SongMetadataComponent metadata={song.metadata} />
      <Title tag="h3">Strumming patterns</Title>
      {[...song.patterns.keys()].map((name) => (
        <PatternWithCountComponent
          key={name}
          name={name}
          pattern={song.patterns.get(name)}
        />
      ))}
      <Title tag="h3">Song</Title>
      {song.parts.map((part, i) => (
        <SongPartComponent key={i} part={part} />
      ))}
    </Content>
  );
}
