import { Box, SxProps, Theme } from "@mui/material";
import { ReactNode } from "react";

export interface OutlinedBoxProps {
  children: ReactNode;
  sx?: SxProps<Theme>;
}

export default function OutlinedBox({ children, sx }: OutlinedBoxProps) {
  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        borderRadius: 2,
        boxShadow: 3,
        mt: 1,
        mb: 2,
        p: 3,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
