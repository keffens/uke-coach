import React from "react";
import {
  FaLongArrowAltDown,
  FaLongArrowAltUp,
  FaTimes,
  FaExchangeAlt,
} from "react-icons/fa";
import { Strum, StrumType } from "../../lib/music";
import styles from "./Song.module.scss";

export function stringHeight(string: number) {
  const f = (string - 1) / 3;
  const top = 1 - 2.25 * f;
  return `${top}em`;
}

export interface StrumComponentProps {
  strum: Strum;
  frets?: string[];
}

export default function StrumComponent({ strum, frets }: StrumComponentProps) {
  // Handle missing strums
  switch (strum.type) {
    case StrumType.Down:
      return (
        <FaLongArrowAltDown className={strum.emphasize ? styles.emStrum : ""} />
      );
    case StrumType.Up:
      return (
        <FaLongArrowAltUp className={strum.emphasize ? styles.emStrum : ""} />
      );
    case StrumType.Percursion:
      return <FaTimes />;
    case StrumType.Arpeggio:
      return (
        <div style={{ transform: "scale(1.2) rotate(-30deg)" }}>
          <FaLongArrowAltDown />
        </div>
      );
    case StrumType.Tremolo:
      return (
        <div style={{ transform: "rotate(-90deg) scaleX(0.9) scaleY(-1.1)" }}>
          <FaExchangeAlt />
        </div>
      );
    case StrumType.Plugged:
      return (
        <span className={styles.strum}>
          {strum.strings.map((string) => (
            <div
              key={string}
              className={styles.string}
              style={{ top: stringHeight(string) }}
            >
              {frets?.[string - 1] ?? "⬤"}
            </div>
          ))}
        </span>
      );
    case StrumType.Pause:
    default:
      return <span className={styles.strum} />;
  }
}
