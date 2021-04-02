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
      {part.header ? <Title tag="h4">{part.header}</Title> : <></>}
      {part.paragraphs.map((paragraph, i) => (
        <BarParagraphComponent key={i} paragraph={paragraph} />
      ))}
    </>
  );
}
