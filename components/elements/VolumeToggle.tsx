import React, { useState } from "react";
import { Button } from "bloomer";
import VolumeIcon from "./VolumeIcon";
import { toggleVolume, VolumeSetting } from "../../lib/music";

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
    <Button
      style={{ verticalAlign: "middle" }}
      className="is-white"
      onClick={() => {
        const newVol = toggleVolume(vol);
        setVolume(newVol);
        if (onChange) onChange(newVol);
      }}
    >
      <span className="icon has-text-primary-dark">
        <VolumeIcon vol={vol} style={{ fontSize: "2em" }} />
      </span>
    </Button>
  );
}
