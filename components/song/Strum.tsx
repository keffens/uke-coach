import React from "react";
import { FaLongArrowAltDown, FaLongArrowAltUp, FaTimes } from "react-icons/fa";
import styles from "./Song.module.scss";

enum Type {
  Pause,
  Down,
  Up,
  Percursion,
  Arpeggio,
  Plugged,
}

export class Strum {
  private constructor(
    readonly type: Type,
    readonly emphasize = false,
    readonly fingers?: number[]
  ) {}

  static pause() {
    return new Strum(Type.Pause);
  }

  static down(emphasize = false) {
    return new Strum(Type.Down, emphasize);
  }

  static up(emphasize = false) {
    return new Strum(Type.Up, emphasize);
  }

  static percursion() {
    return new Strum(Type.Percursion);
  }

  static arpeggio() {
    return new Strum(Type.Arpeggio);
  }

  static plugged(fingers: number[]) {
    return new Strum(Type.Plugged, false, fingers);
  }

  // Reads 1 Strum from the pattern starting at the given position.
  // Returns the position after the last character that was read.
  static parseStrum(pattern: string, pos: number): [Strum, number] {
    // TODO: Handle parenthesized chords.
    switch (pattern[pos].toLowerCase()) {
      case "-":
      case " ":
      case ".":
        return [Strum.pause(), pos + 1];
      case "d":
        return [Strum.down(pattern[pos] == "D"), pos + 1];
      case "u":
        return [Strum.up(pattern[pos] == "U"), pos + 1];
      case "x":
        return [Strum.percursion(), pos + 1];
      case "a":
        return [Strum.arpeggio(), pos + 1];
      default:
        throw new Error(
          `There's no strum associated with letter ${pattern[pos]}`
        );
    }
  }

  Render = () => {
    // Handle missing strums
    switch (this.type) {
      case Type.Down:
        return <FaLongArrowAltDown />;
      case Type.Up:
        return <FaLongArrowAltUp />;
      case Type.Percursion:
        return <FaTimes />;
      case Type.Pause:
      default:
        return <span className={styles.pause} />;
    }
  };
}
