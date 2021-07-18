import { Column, Columns, Title, Subtitle } from "bloomer";
import { SongMetadata } from "../../lib/music";

interface SubtitleProps {
  artist?: string;
}

function SongSubtitle({ artist }: SubtitleProps) {
  if (!artist) return null;
  return (
    <Subtitle tag="h2" hasTextAlign="centered">
      by {artist}
    </Subtitle>
  );
}

interface MetadataColumnProps {
  name: string;
  value?: string | number;
}

function MetadataColumn({ name, value }: MetadataColumnProps) {
  if (!value) {
    return <></>;
  }
  return (
    <Column style={{ whiteSpace: "nowrap" }}>
      {name}: {value}
    </Column>
  );
}

export interface SongMetadataComponentProps {
  metadata: SongMetadata;
}

export default function SongMetadataComponent({
  metadata,
}: SongMetadataComponentProps) {
  return (
    <>
      <Title tag="h1" hasTextAlign="centered">
        {metadata.title}
      </Title>
      <SongSubtitle artist={metadata.artist} />
      <Columns isMultiline isMobile>
        <MetadataColumn name="composer" value={metadata.composer} />
        <MetadataColumn name="lyricist" value={metadata.lyricist} />
        <MetadataColumn name="album" value={metadata.album} />
        <MetadataColumn name="year" value={metadata.year} />
        <MetadataColumn name="©" value={metadata.copyright} />
        <MetadataColumn name="key" value={metadata.key?.render()} />
        <MetadataColumn name="time" value={metadata.time?.toString()} />
        <MetadataColumn name="tempo" value={metadata.tempo} />
        <MetadataColumn name="capo" value={metadata.capo} />
      </Columns>
    </>
  );
}
