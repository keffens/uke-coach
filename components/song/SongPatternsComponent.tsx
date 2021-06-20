import React from "react";
import { Column, Columns, Title } from "bloomer";
import PatternWithCountComponent from "./PatternWithCountComponent";
import { Instrument, InstrumentLib, Pattern } from "../../lib/music";

// The id is the pattern's string representation, appended with the number of
// strings in the instrument if it's a tab.
function patternId(pattern: Pattern, instrument: Instrument) {
  let id = pattern.toString();
  if (pattern.useTab()) {
    id += instrument.tuning.length;
  }
  return id;
}

function patternName(pattern: Pattern, instruments: string[], max: number) {
  if (instruments.length === max) {
    return pattern.name;
  }
  return `${pattern.name} (${instruments.join(" / ")})`;
}

export interface SongPatternsComponentProps {
  instrumentLib: InstrumentLib;
}

export default function SongPatternsComponent({
  instrumentLib,
}: SongPatternsComponentProps) {
  let uniquePatterns = new Map<
    string,
    { pattern: Pattern; instruments: string[] }
  >();
  for (const instrument of instrumentLib.instruments) {
    for (const pattern of instrument.getPatterns(/*onlyMain=*/ true)) {
      const id = patternId(pattern, instrument);
      const existing = uniquePatterns.get(id);
      if (existing) {
        existing.instruments.push(instrument.name);
      } else {
        uniquePatterns.set(id, { pattern, instruments: [instrument.name] });
      }
    }
  }
  if (!uniquePatterns.size) return <></>;
  const patterns = [];
  for (const pattern of uniquePatterns.values()) {
    patterns.push(
      pattern.pattern.clone(
        patternName(
          pattern.pattern,
          pattern.instruments,
          instrumentLib.instruments.length
        )
      )
    );
  }
  return (
    <>
      <Title tag="h3" className="mb-2">
        Strumming patterns
      </Title>
      <Columns isMultiline isMobile>
        {patterns.map((pattern, i) => (
          <Column key={i} style={{ minWidth: "max-content" }}>
            <PatternWithCountComponent key={i} pattern={pattern} />
          </Column>
        ))}
      </Columns>
    </>
  );
}
