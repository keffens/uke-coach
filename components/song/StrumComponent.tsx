import React from "react";
import {
  FaLongArrowAltDown,
  FaLongArrowAltUp,
  FaTimes,
  FaExchangeAlt,
} from "react-icons/fa";
import { Strum, StrumType } from "../../lib/music";
import styles from "./Song.module.scss";

export const STRING_SEP = 0.4;

export function stringHeight(string: number) {
  return `${STRING_SEP * 2 * (string - 1) - 0.9}em`;
}

export interface StrumComponentProps {
  strum: Strum;
  frets?: string[] | null;
  highlight?: boolean;
}

export default function StrumComponent({ strum, frets }: StrumComponentProps) {
  let classes = [styles.strum];
  if (strum.emphasize) classes.push(styles.emStrum);

  switch (strum.type) {
    case StrumType.Down:
      return (
        <div className={classes.join(" ")}>
          <FaLongArrowAltDown />
        </div>
      );
    case StrumType.Up:
      return (
        <div className={classes.join(" ")}>
          <FaLongArrowAltUp className={classes.join(" ")} />
        </div>
      );
    case StrumType.Percursion:
      return (
        <div className={classes.join(" ")}>
          <FaTimes className={classes.join(" ")} />
        </div>
      );
    case StrumType.Arpeggio:
      return (
        <div className={classes.join(" ")}>
          <FaLongArrowAltDown
            style={{ transform: "scale(1.2) rotate(-30deg)" }}
          />
        </div>
      );
    case StrumType.Tremolo:
      return (
        <div className={classes.join(" ")}>
          <FaExchangeAlt
            style={{ transform: "rotate(-90deg) scaleX(0.9) scaleY(-1.1)" }}
          />
        </div>
      );
    case StrumType.Plugged:
      classes.push(styles.tabStrum);
      return (
        <div className={classes.join(" ")}>
          {strum.strings.map((string) => (
            <div
              key={string}
              className={styles.string}
              style={{
                bottom: stringHeight(string),
              }}
            >
              {frets?.[string - 1] ?? (
                <span style={{ fontSize: "80%" }}>⬤</span>
              )}
            </div>
          ))}
        </div>
      );
    case StrumType.Tab:
      return (
        <div className={classes.join(" ")}>
          {strum.frets.map((fret, string) => (
            <div
              key={string}
              className={styles.string}
              style={{
                top: stringHeight(string + 1),
              }}
            >
              {fret < 0 ? "" : fret}
            </div>
          ))}
        </div>
      );
    case StrumType.Pause:
    default:
      return <div className={classes.join(" ")} />;
  }
}
