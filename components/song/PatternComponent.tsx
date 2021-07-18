import {
  Bar,
  Instrument,
  InstrumentLib,
  Pattern,
  PitchedNote,
} from "../../lib/music";
import { assert } from "../../lib/util";
import BackgroundGrid from "../elements/BackgroundGrid";
import styles from "./Song.module.scss";
import StrumComponent, { stringHeight, STRING_SEP } from "./StrumComponent";

interface StringLabelsProps {
  enable: boolean;
  tuning: PitchedNote[];
}

function StringLabels({ enable, tuning }: StringLabelsProps) {
  if (!enable || !tuning) return null;
  const notes = tuning.map((note) => note.note);
  return (
    <span className={styles.stringLabel}>
      {notes.map((note, i) => (
        <div
          key={i}
          className={styles.string}
          style={{ bottom: stringHeight(i + 1) }}
        >
          {note}
        </div>
      ))}
    </span>
  );
}

interface TabLinesComponent {
  useTab: boolean;
  strings: number;
}

function TabLines({ useTab, strings }: TabLinesComponent) {
  return <BackgroundGrid cols={1} rows={useTab ? strings - 1 : 0} />;
}

export interface PatternComponentProps {
  pattern?: Pattern;
  patternIdx?: number;
  bar?: Bar;
  showStringLabels?: boolean;
  useTab?: boolean;
  instrumentLib?: InstrumentLib;
  instrumentIdx?: number;
  instrument?: Instrument;
  alwaysShow?: boolean;
}

export default function PatternComponent({
  pattern,
  patternIdx,
  bar,
  showStringLabels,
  useTab,
  instrumentLib,
  instrumentIdx,
  instrument,
  alwaysShow,
}: PatternComponentProps) {
  assert(
    !!pattern !== !!bar,
    "Either bar or pattern is required for PatternComponent."
  );
  instrument = instrument ?? instrumentLib?.instruments[instrumentIdx ?? -1];
  assert(
    instrument,
    "instrument or instrumentLib + instrumentIdx is required for " +
      "PatternComponent."
  );
  if (!instrument.show && !alwaysShow) {
    // This instrument's track is hidden.
    return null;
  }
  if (bar) {
    assert(instrumentIdx != null, "instrumentIdx is required if bar is set");
    pattern = bar.patterns[instrumentIdx];
    patternIdx = bar.patternIdxs[instrumentIdx];
  }
  assert(pattern, "This should never happen");
  if (pattern.bars === 0) {
    return <div className={styles.pattern}></div>;
  }

  useTab = useTab || pattern.useTab();
  patternIdx = patternIdx! % pattern.bars;
  const strums = pattern.strums.slice(
    patternIdx * pattern.strumsPerBar,
    (patternIdx + 1) * pattern.strumsPerBar
  );

  const height = useTab
    ? `${(instrument.tuning.length - 1) * STRING_SEP}em`
    : undefined;
  return (
    <div className={styles.pattern} style={{ height }}>
      <TabLines useTab={useTab} strings={instrument.tuning.length} />
      <StringLabels
        enable={!!useTab && !!showStringLabels}
        tuning={instrument.tuning}
      />
      {strums.map((s, i) => (
        <StrumComponent
          key={`strum-${i}`}
          strum={s}
          chord={bar?.getChordForStrum(i)}
          chordLib={instrument?.chordLib}
        />
      ))}
    </div>
  );
}
