import React, { useState } from "react";
import { IconButton } from "@mui/material";
import { VisibilityOffOutlined, VisibilityOutlined } from "@mui/icons-material";

interface VisibilityToggleProps {
  initialVisibility: boolean;
  onChange?: (visibility: boolean) => void;
}

export default function VisibilityToggle({
  initialVisibility,
  onChange,
}: VisibilityToggleProps) {
  const [isVisible, setVisibility] = useState(initialVisibility);
  return (
    <IconButton
      aria-label="toggle visibility of the instrument"
      color="primary"
      onClick={() => {
        setVisibility(!isVisible);
        if (onChange) onChange(!isVisible);
      }}
      sx={{ p: 0.5 }}
    >
      {isVisible ? <VisibilityOutlined /> : <VisibilityOffOutlined />}
    </IconButton>
  );
}
