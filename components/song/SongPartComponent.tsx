import { Title } from "bloomer";
import React from "react";
import { SongPart } from "../../lib/music";
import BarParagraphComponent from "./BarParagraphComponent";

export interface SongPartComponentProps {
  part: SongPart;
}

export default function SongPartComponent({ part }: SongPartComponentProps) {
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
        <BarParagraphComponent key={i} paragraph={paragraph} />
      ))}
    </>
  );
}
