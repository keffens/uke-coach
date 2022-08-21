import { Box, SxProps, Theme } from "@mui/material";
import React, { ReactNode } from "react";

export interface SpacedGridRowProps {
  children: ReactNode;
  spacing: number[];
  sx?: SxProps<Theme>;
}

export default function SpacedGridRow({
  children,
  spacing,
  sx,
}: SpacedGridRowProps) {
  const gridTemplateColumns = spacing.map((s) => `${s}fr`).join(" ");
  return (
    <Box display="grid" gridTemplateColumns={gridTemplateColumns} sx={sx}>
      {children}
    </Box>
  );
}
