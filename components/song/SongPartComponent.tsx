import React from "react";
import { Title } from "bloomer";
import BarParagraphComponent from "./BarParagraphComponent";
import { InstrumentLib, SongPart } from "../../lib/music";

export interface SongPartComponentProps {
  part: SongPart;
  instrumentLib: InstrumentLib;
}

export default function SongPartComponent({
  part,
  instrumentLib,
}: SongPartComponentProps) {
  return (
    <>
      {part.header ? (
        <Title tag="h4" isMarginless className="mt-4 mb-2">
          {part.header}
        </Title>
      ) : (
        <div className="mt-5"></div>
      )}
      {part.paragraphs.map((paragraph, i) => (
        <BarParagraphComponent
          key={i}
          paragraph={paragraph}
          instrumentLib={instrumentLib}
        />
      ))}
    </>
  );
}
