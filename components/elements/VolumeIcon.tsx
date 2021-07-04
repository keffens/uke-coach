import React from "react";
import { FiVolume1, FiVolume2, FiVolumeX } from "react-icons/fi";
import { VolumeSetting } from "../../lib/music";

export interface VolumeIconProps {
  vol: VolumeSetting;
  style?: React.CSSProperties;
  className?: string;
}

export default function VolumeIcon({ vol, style, className }: VolumeIconProps) {
  switch (vol) {
    case VolumeSetting.High:
      return <FiVolume2 style={style} className={className} />;
    case VolumeSetting.Low:
      return <FiVolume1 style={style} className={className} />;
    case VolumeSetting.Mute:
      return <FiVolumeX style={style} className={className} />;
  }
}
