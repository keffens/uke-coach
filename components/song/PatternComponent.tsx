import { Bar, InstrumentLib, TICKS_PER_BEAT } from "../../lib/music";
import { Pattern } from "../../lib/music/pattern";
import { assert, range } from "../../lib/util";
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
  pattern?: Pattern;
  patternIdx?: number;
  bar?: Bar;
  showStringLabels?: boolean;
  useTab?: boolean;
  instrumentLib?: InstrumentLib;
  instrumentIdx?: number;
  highlightTick?: number;
}

export default function PatternComponent({
  pattern,
  patternIdx,
  bar,
  showStringLabels,
  useTab,
  instrumentLib,
  instrumentIdx,
  highlightTick,
}: PatternComponentProps) {
  assert(
    !!pattern !== !!bar,
    "Either bar or pattern is required for PatternComponent."
  );
  if (bar) {
    assert(instrumentIdx != null, "instrumentIdx is required if bar is set");
    if (instrumentLib?.instruments[instrumentIdx].show === false) {
      // This instrument's track is hidden.
      return <></>;
    }
    pattern = bar.patterns[instrumentIdx];
    patternIdx = bar.patternIdxs[instrumentIdx];
  }
  assert(pattern, "This should never happen");
  if (pattern.bars === 0) {
    return <div className={styles.pattern}></div>;
  }

  useTab = useTab || pattern.useTab();
  patternIdx = patternIdx! % pattern.bars;
  const chordLib = instrumentLib
    ? [...instrumentLib.instruments][instrumentIdx ?? 0].chordLib
    : undefined;
  const strums = pattern.strums.slice(
    patternIdx * pattern.strumsPerBar,
    (patternIdx + 1) * pattern.strumsPerBar
  );
  const highlightStrum = Math.floor(
    (pattern.strumsPerBeat * (highlightTick ?? NaN)) / TICKS_PER_BEAT
  );
  return (
    <div className={styles.pattern}>
      <TabLines useTab={useTab} />
      {showStringLabels ? <StringLabels useTab={useTab} /> : <></>}
      <span className={styles.barSeperator} />
      {strums.map((s, i) => (
        <StrumComponent
          key={`strum-${i}`}
          strum={s}
          frets={chordLib?.getStringFrets(bar?.getChordForStrum(i) ?? null)}
          highlight={i === highlightStrum}
        />
      ))}
      <span className={styles.barSeperator} />
    </div>
  );
}
