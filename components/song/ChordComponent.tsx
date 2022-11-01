import { Box, SxProps, Theme, useTheme } from "@mui/material";
import { Chord } from "../../lib/music";
import { STRUM_SIZE_PX } from "./StrumComponent";

export interface ChordComponentProps {
  chord?: Chord | null;
  base?: string | number | null;
  sup?: string | null;
  sx?: SxProps<Theme>;
}

export default function ChordComponent({
  chord,
  base,
  sup,
  sx,
}: ChordComponentProps) {
  const theme = useTheme();

  if (chord) {
    base = chord.base;
    sup = chord.sup;
  }
  base = base || "\u200b"; // Add a zero width space to force line height.
  sup = sup ?? null;

  return (
    <Box
      color={theme.palette.secondary.main}
      fontWeight="bold"
      mx="-16px"
      textAlign="center"
      width={`${32 + STRUM_SIZE_PX}px`}
      sx={sx}
    >
      {base}
      {sup && (
        <Box component="span" fontSize="65%" sx={{ verticalAlign: "top" }}>
          {sup}
        </Box>
      )}
    </Box>
  );
}
