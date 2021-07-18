import { Title } from "bloomer";
import PatternComponent from "./PatternComponent";
import { Pattern, Instrument } from "../../lib/music";
import { range } from "../../lib/util";
import styles from "./Song.module.scss";

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
      <Title tag="h5" isSize={6} isMarginless>
        {pattern.name}
      </Title>
      {range(pattern.bars).map((idx) => (
        <div className={styles.barContainer} key={idx}>
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
