import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Tooltip,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";

export const BARS_PER_LINE_VALUES = [1, 2, 3, 4, 6, 8, 12, 16];
export type BarsPerLine = typeof BARS_PER_LINE_VALUES[number];

export interface BarsPerLineSelectProps {
  maxStrumsPerBar: number;
  onChange?: (val: BarsPerLine) => void;
}

// TODO: Support scrolling with page or close on scroll.
export default function BarsPerLineSelect({
  maxStrumsPerBar,
  onChange,
}: BarsPerLineSelectProps) {
  const [val, setVal] = useState<number>(1);
  const windowWidth = useRef(0);
  const valRef = useRef(0);
  valRef.current = val;

  const handleResize = () => {
    const w = window.innerWidth;
    let proposedBars = w / (24 * maxStrumsPerBar);
    proposedBars = BARS_PER_LINE_VALUES.reduce((prev, cur) =>
      cur > proposedBars ? prev : cur
    );
    if (
      !valRef.current ||
      (windowWidth.current < w && valRef.current < proposedBars) ||
      (windowWidth.current > w && valRef.current > proposedBars)
    ) {
      if (onChange) onChange(proposedBars);
      setVal(proposedBars);
    }
    windowWidth.current = w;
  };

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <Tooltip
      placement="top"
      title="Set the maximum number of bars to show per line."
    >
      <FormControl sx={{ my: 1, verticalAlign: "middle" }}>
        <InputLabel id="demo-simple-select-label" htmlFor="bars-select">
          #bars
        </InputLabel>
        <Select
          labelId="bars-select-label"
          value={`${val}`}
          label="#bars"
          size="small"
          onChange={(e: SelectChangeEvent) => {
            if (onChange) onChange(+e.target.value);
            setVal(+e.target.value);
          }}
          sx={{ width: "72px" }}
          MenuProps={{
            disableScrollLock: true,
          }}
        >
          {BARS_PER_LINE_VALUES.map((v) => (
            <MenuItem key={v} value={v}>
              {v}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Tooltip>
  );
}
