import React from "react";
import { FaLongArrowAltDown, FaLongArrowAltUp, FaTimes } from "react-icons/fa";
import { Strum, StrumType } from "../../lib/music";
import styles from "./Song.module.scss";

export function stringHeight(string: number) {
  const f = (string - 1) / 3;
  const top = 1.3 - 2.75 * f;
  return `${top}em`;
}

export interface StrumComponentProps {
  strum: Strum;
}

export default function StrumComponent({ strum }: StrumComponentProps) {
  // Handle missing strums
  switch (strum.type) {
    case StrumType.Arpeggio:
    case StrumType.Down:
      return <FaLongArrowAltDown />;
    case StrumType.Up:
      return <FaLongArrowAltUp />;
    case StrumType.Percursion:
      return <FaTimes />;
    case StrumType.Plugged:
      return (
        <span className={styles.strum}>
          {strum.strings.map((string) => (
            <div
              key={string}
              className={styles.string}
              style={{ top: stringHeight(string) }}
            >
              ⬤
            </div>
          ))}
        </span>
      );
    case StrumType.Pause:
    default:
      return <span className={styles.strum} />;
  }
}
