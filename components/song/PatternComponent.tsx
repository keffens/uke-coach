import { Pattern } from "../../lib/music/pattern";
import { range } from "../../lib/util";
import styles from "./Song.module.scss";
import StrumComponent, { stringHeight } from "./StrumComponent";

interface StringLabelsProps {
  useTab: boolean;
}

function StringLabels({ useTab }: StringLabelsProps) {
  if (!useTab) return <></>;
  const strings = ["G", "C", "E", "A"];
  return (
    <span className={styles.stringLabel}>
      {strings.map((string, i) => (
        <div
          key={string}
          className={styles.string}
          style={{ top: stringHeight(i + 1) }}
        >
          {string}
        </div>
      ))}
    </span>
  );
}

interface TabLinesComponent {
  useTab: boolean;
}

function TabLines({ useTab }: TabLinesComponent) {
  const lines = new Array<string>();
  if (useTab) {
    for (const i of range(0, 101, 33.3333)) {
      lines.push(`${i}%`);
    }
  } else {
    lines.push("50%");
  }

  return (
    <>
      {lines.map((line) => (
        <div
          key={`tab-line-${line}`}
          className={styles.tabLine}
          style={{ bottom: line }}
        />
      ))}
    </>
  );
}

export interface PatternComponentProps {
  pattern: Pattern;
  bar?: number;
  showStringLabels?: boolean;
  useTab?: boolean;
}

export default function PatternComponent({
  pattern,
  bar,
  showStringLabels,
  useTab,
}: PatternComponentProps) {
  useTab = useTab || pattern.useTab();
  if (pattern.bars === 0) {
    return <div className={styles.pattern}></div>;
  }
  bar = (bar ?? 0) % pattern.bars;
  const strums = pattern.strums.slice(
    bar * pattern.strumsPerBar,
    (bar + 1) * pattern.strumsPerBar
  );
  return (
    <div className={styles.pattern}>
      <TabLines useTab={useTab} />
      {showStringLabels ? <StringLabels useTab={useTab} /> : <></>}
      <span className={styles.barSeperator} />
      {strums.map((s, i) => (
        <StrumComponent key={`strum-${i}`} strum={s} />
      ))}
      <span className={styles.barSeperator} />
    </div>
  );
}
