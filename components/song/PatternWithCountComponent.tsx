import PatternComponent from "./PatternComponent";
import { Pattern, Instrument } from "../../lib/music";
import { range } from "../../lib/util";
import { Grid, Stack, Typography } from "@mui/material";
import ChordComponent from "./ChordComponent";

export interface PatternWithCountComponentProps {
  pattern: Pattern;
  instrument: Instrument;
}

export default function PatternWithCountComponent({
  pattern,
  instrument,
}: PatternWithCountComponentProps) {
  const beats = range(1, pattern.time.beats + 1);
  return (
    <>
      <Typography variant="h5">{pattern.name}</Typography>
      <Stack direction="row" pl={2}>
        {range(pattern.bars).map((idx) => (
          <Stack key={idx}>
            <Grid container>
              {beats.map((beat) => (
                <Grid item key={beat} xs>
                  <ChordComponent base={beat} />
                </Grid>
              ))}
            </Grid>
            <PatternComponent
              pattern={pattern}
              patternIdx={idx}
              showStringLabels={idx === 0}
              instrument={instrument}
              alwaysShow
            />
          </Stack>
        ))}
      </Stack>
    </>
  );
}
