import { Title } from "bloomer";
import { Pattern } from "../../lib/music/pattern";
import { range } from "../../lib/util";
import PatternComponent from "./PatternComponent";
import styles from "./Song.module.scss";

export interface PatternWithCountComponentProps {
  name: string;
  pattern: Pattern;
}

export default function PatternWithCountComponent({
  name,
  pattern,
}: PatternWithCountComponentProps) {
  const beats = range(1, pattern.time.beats + 1);
  return (
    <div className="block">
      <Title tag="h4" isSize={6} isMarginless className={styles.patternName}>
        {name}
      </Title>
      {range(pattern.bars).map((bar) => (
        <div className={styles.barContainer} key={`bar-${bar}`}>
          <div className={styles.beatCount}>
            {beats.map((beat, i) => (
              <span key={`beat-${i}`}>{beat}</span>
            ))}
          </div>
          <PatternComponent
            pattern={pattern}
            bar={bar}
            showStringLabels={bar === 0}
          />
        </div>
      ))}
    </div>
  );
}
