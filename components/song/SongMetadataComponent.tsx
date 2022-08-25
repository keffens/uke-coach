import { Box, Grid, Typography } from "@mui/material";
import { SongMetadata } from "../../lib/music";

interface MetadataCellProps {
  name: string;
  value?: string | number;
}

function MetadataCell({ name, value }: MetadataCellProps) {
  if (!value) {
    return null;
  }
  return (
    <Grid item xs whiteSpace="nowrap">
      {name}: {value}
    </Grid>
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
        {metadata.artist && (
          <Typography variant="h2">by {metadata.artist}</Typography>
        )}
      </Box>
      <Grid container columnSpacing={4} my={1}>
        <MetadataCell name="composer" value={metadata.composer} />
        <MetadataCell name="lyricist" value={metadata.lyricist} />
        <MetadataCell name="album" value={metadata.album} />
        <MetadataCell name="year" value={metadata.year} />
        <MetadataCell name="©" value={metadata.copyright} />
        <MetadataCell name="key" value={metadata.key?.render()} />
        <MetadataCell name="time" value={metadata.time?.toString()} />
        <MetadataCell name="tempo" value={metadata.tempo} />
        <MetadataCell name="capo" value={metadata.capo} />
      </Grid>
    </>
  );
}
