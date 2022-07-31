import {
  VolumeDownOutlined,
  VolumeOffOutlined,
  VolumeUpOutlined,
} from "@mui/icons-material";
import { SxProps } from "@mui/material";
import { Theme } from "@mui/system";
import React from "react";
import { VolumeSetting } from "../../lib/music";

export interface VolumeIconProps {
  vol: VolumeSetting;
  fontSize?: "small" | "inherit" | "large" | "medium";
  sx?: SxProps<Theme>;
}

export default function VolumeIcon({ vol, fontSize, sx }: VolumeIconProps) {
  switch (vol) {
    case VolumeSetting.High:
      return <VolumeUpOutlined fontSize={fontSize} sx={sx} />;
    case VolumeSetting.Low:
      return <VolumeDownOutlined fontSize={fontSize} sx={sx} />;
    case VolumeSetting.Mute:
      return <VolumeOffOutlined fontSize={fontSize} sx={sx} />;
  }
}
