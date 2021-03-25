import React from "react";
import { SongPart } from "../../lib/music";
import styles from "./Song.module.scss";

export interface SongPartComponentProps {
  part: SongPart;
}

export default function SongPartComponent({ part }: SongPartComponentProps) {
  return (
    <>
      {part.header ? (
        <h3 className={styles.partHeader}>{part.header}</h3>
      ) : (
        <></>
      )}
    </>
  );
}
