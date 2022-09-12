import React from "react";
import styles from "./BackgroundGrid.module.scss";
import { range } from "../../lib/util";
import { Box, SxProps, Theme } from "@mui/material";

interface BackgroundGridProps {
  cols: number;
  rows: number;
  sx?: SxProps<Theme>;
}

export default function BackgroundGrid({
  cols,
  rows,
  sx,
}: BackgroundGridProps) {
  sx = {
    gridTemplateColumns: "1fr ".repeat(cols),
    ...sx,
  };
  const className = rows === 0 ? styles.line : styles.grid;
  return (
    <Box className={className} sx={sx}>
      {range((rows || 1) * cols).map((i) => (
        <div key={i} />
      ))}
    </Box>
  );
}
