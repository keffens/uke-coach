import React, { useState } from "react";
import VolumeIcon from "./VolumeIcon";
import { toggleVolume, VolumeSetting } from "../../lib/music";
import { IconButton } from "@mui/material";

interface VolumeToggleProps {
  initialVolume: VolumeSetting;
  onChange?: (vol: VolumeSetting) => void;
}

export default function VolumeToggle({
  initialVolume,
  onChange,
}: VolumeToggleProps) {
  const [vol, setVolume] = useState(initialVolume);
  return (
    <IconButton
      aria-label="toggle volume of the instrument"
      color="primary"
      onClick={() => {
        const newVol = toggleVolume(vol);
        setVolume(newVol);
        if (onChange) onChange(newVol);
      }}
      sx={{ p: 0.5 }}
    >
      <VolumeIcon vol={vol} />
    </IconButton>
  );
}
