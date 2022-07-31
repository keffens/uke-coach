import React, { ReactNode, useState } from "react";
import { IconButton, Tooltip } from "@mui/material";

interface ToggleIconProps {
  children: ReactNode;
  initialState?: boolean;
  onClick: (state: boolean) => void;
  tooltip?: string;
}

export default function ToggleIcon({
  children,
  initialState,
  onClick,
  tooltip,
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
        sx={{ p: 0.5 }}
      >
        {children}
      </IconButton>
    </Tooltip>
  );
}
