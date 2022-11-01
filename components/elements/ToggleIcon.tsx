import React, { ReactNode, useState } from "react";
import { IconButton, SxProps, Theme, Tooltip } from "@mui/material";

interface ToggleIconProps {
  children: ReactNode;
  initialState?: boolean;
  onClick: (state: boolean) => void;
  tooltip?: string;
  sx?: SxProps<Theme>;
}

export default function ToggleIcon({
  children,
  initialState,
  onClick,
  tooltip,
  sx,
}: ToggleIconProps) {
  const [state, setState] = useState(!!initialState);
  return (
    <Tooltip title={tooltip ?? ""}>
      <IconButton
        aria-label={tooltip}
        color={state ? "primary" : "default"}
        size="large"
        onClick={() => {
          setState(!state);
          onClick(!state);
        }}
        sx={{ ...sx, p: 0.5 }}
      >
        {children}
      </IconButton>
    </Tooltip>
  );
}
