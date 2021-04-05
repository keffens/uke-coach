import { Title } from "bloomer";
import PatternComponent from "./PatternComponent";
import { Pattern } from "../../lib/music";
import { range } from "../../lib/util";
import styles from "./Song.module.scss";

export interface PatternWithCountComponentProps {
  pattern: Pattern;
}

export default function PatternWithCountComponent({
  pattern,
}: PatternWithCountComponentProps) {
  const beats = range(1, pattern.time.beats + 1);
  return (
    <div className="block">
      <Title tag="h4" isSize={6} isMarginless>
        {pattern.name}
      </Title>
      {range(pattern.bars).map((bar) => (
        <div className={styles.barContainer} key={bar}>
          <div className={styles.beatCount}>
            {beats.map((beat) => (
              <span key={beat}>{beat}</span>
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
