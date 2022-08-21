import { Box, Typography } from "@mui/material";
import { Column, Columns } from "bloomer";
import { SongMetadata } from "../../lib/music";

interface SubtitleProps {
  artist?: string;
}

function SongSubtitle({ artist }: SubtitleProps) {
  if (!artist) return null;
  return <Typography variant="h2">by {artist}</Typography>;
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
      <Box mb={{ xs: 1, md: 2 }}>
        <Typography variant="h1">{metadata.title}</Typography>
        <SongSubtitle artist={metadata.artist} />
      </Box>
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
