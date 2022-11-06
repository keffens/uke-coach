import { Box, SxProps, Theme, useTheme } from "@mui/material";
import { Chord } from "../../lib/music";
import { STRUM_SIZE_PX } from "./StrumComponent";

export interface ChordComponentProps {
  chord?: Chord | null;
  base?: string | number | null;
  sup?: string | null;
  highlight?: boolean;
  sx?: SxProps<Theme>;
}

export default function ChordComponent({
  chord,
  base,
  sup,
  highlight,
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
      color={
        highlight
          ? theme.palette.secondary.contrastText
          : theme.palette.secondary.main
      }
      fontWeight="bold"
      mx="-16px"
      textAlign="center"
      width={`${32 + STRUM_SIZE_PX}px`}
      height="20px" // Some fonts have different sizes for ♯ and ♭.
      sx={sx}
    >
      <Box
        display="inline-block"
        bgcolor={highlight ? theme.palette.secondary.main : undefined}
        borderRadius="10px"
        minWidth="12px"
        px="4px"
      >
        {base}
        {sup && (
          <Box component="span" fontSize="65%" sx={{ verticalAlign: "top" }}>
            {sup}
          </Box>
        )}
      </Box>
    </Box>
  );
}
