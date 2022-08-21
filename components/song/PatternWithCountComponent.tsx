import { Title } from "bloomer";
import PatternComponent from "./PatternComponent";
import { Pattern, Instrument } from "../../lib/music";
import { range } from "../../lib/util";
import styles from "./PatternWithCount.module.scss";
import { Typography } from "@mui/material";

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
    <div className="block">
      <Typography variant="h5">{pattern.name}</Typography>
      {range(pattern.bars).map((idx) => (
        <div key={idx} className={styles.barContainer}>
          <div className={styles.beatCount}>
            {beats.map((beat) => (
              <span key={beat}>{beat}</span>
            ))}
          </div>
          <PatternComponent
            pattern={pattern}
            patternIdx={idx}
            showStringLabels={idx === 0}
            instrument={instrument}
            alwaysShow
          />
        </div>
      ))}
    </div>
  );
}
