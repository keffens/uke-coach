import {
  Box,
  InputAdornment,
  OutlinedInput,
  Popper,
  Slider,
  Typography,
} from "@mui/material";
import React, { useRef, useState } from "react";
import OutlinedBox from "./OutlinedBox";

const GLOBAL_MIN = 20;
const GLOBAL_MAX = 400;

interface BpmSelectProps {
  initialBpm: number;
  onChange: (bpm: number) => void;
}

export default function BpmSelect({ initialBpm, onChange }: BpmSelectProps) {
  const [bpm, setBpm] = useState(initialBpm);
  const [hasFocus, setFocus] = useState(false);
  const input = useRef(null);

  const marks = [
    {
      value: Math.floor(0.5 * initialBpm),
      label: "0.5x",
    },
    {
      value: Math.floor(0.75 * initialBpm),
      label: "0.75x",
    },
    {
      value: initialBpm,
      label: "1.0x",
    },
    {
      value: Math.floor(1.25 * initialBpm),
      label: "1.25x",
    },
    {
      value: Math.floor(1.5 * initialBpm),
      label: "1.5x",
    },
  ];
  const min = Math.max(GLOBAL_MIN, marks[0].value);
  const max = Math.min(GLOBAL_MAX, marks[marks.length - 1].value);

  const updateBpm = (value: number | string, sticky = false) => {
    if (typeof value === "string") {
      value = parseInt(value.replace(/\D/g, ""));
    }

    if (sticky) {
      const stickyRange = (max - min) / 20;
      for (const { value: mark } of marks) {
        if (mark - stickyRange <= value && value <= mark + stickyRange) {
          value = mark;
          break;
        }
      }
    }

    if (value >= 20) {
      value = Math.min(value, 400);
      setBpm(value);
      onChange(value);
    } else {
      setBpm(value || 0);
    }
  };

  const onBlur = () => {
    console.log("onBlur", bpm);
    if (bpm < GLOBAL_MIN) {
      setBpm(GLOBAL_MIN);
      onChange(GLOBAL_MIN);
    }
    setFocus(false);
  };

  return (
    <Box
      display="inline-block"
      my={1}
      onFocus={() => setFocus(true)}
      onBlur={onBlur}
    >
      <OutlinedInput
        onChange={(e) => updateBpm(e.target.value)}
        aria-label="set bpm"
        endAdornment={
          <InputAdornment position="end">
            <Typography fontSize="small" fontWeight="bold">
              bpm
            </Typography>
          </InputAdornment>
        }
        ref={input}
        size="small"
        value={bpm}
        sx={{ width: "90px" }}
        inputProps={{ style: { textAlign: "right" } }}
      />
      <Popper
        anchorEl={input.current}
        placement="bottom"
        open={hasFocus}
        sx={{ zIndex: 10 }}
      >
        <OutlinedBox sx={{ px: 3, py: 0.5, width: "320px" }}>
          <Slider
            min={min}
            max={max}
            marks={marks}
            step={1}
            value={bpm}
            onChange={(_e, val) => {
              updateBpm(val as number, /*sticky=*/ true);
            }}
          />
        </OutlinedBox>
      </Popper>
    </Box>
  );
}
