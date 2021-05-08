import { Note, Scale, renderNote } from "./note";

/** RegExp to parse a key signature. */
const PARSE_KEY_RE = new RegExp(
  `^(${Object.values(Note).join("|")})(${Object.values(Scale).join("|")})$`
);

/** A key signature, i.e., a note and a scale. */
export class KeySignature {
  constructor(readonly note: Note, readonly scale: Scale) {}

  /** Parses the key signature from a string. */
  static parse(text: string): KeySignature {
    const match = PARSE_KEY_RE.exec(text.trim());
    if (match == null) {
      throw new Error(`Failed to parse key signature from "${text}".`);
    }
    return new KeySignature(match[1] as Note, match[2] as Scale);
  }

  /** Returns the string representation. */
  toString(): string {
    return `${this.note}${this.scale}`;
  }

  /** Renders the signature for display on the web. */
  render(): string {
    return `${renderNote(this.note)}${this.scale}`;
  }
}

/** Represents a time signature. */
export class TimeSignature {
  constructor(readonly beats: number, readonly noteValue: number) {}

  /** Used as default signature. */
  static readonly DEFAULT = new TimeSignature(4, 4);

  /** Parses the time signature form a string. */
  static parse(text: string): TimeSignature {
    const match = /^(\d+)\/(\d+)$/.exec(text.trim());
    const beats = parseInt(match?.[1] ?? "");
    const noteValue = parseInt(match?.[2] ?? "");
    if (!beats || beats <= 0 || !noteValue || noteValue <= 0) {
      throw new Error(`Failed to parse time signature from "${text}".`);
    }
    return new TimeSignature(beats, noteValue);
  }

  /** Returns the string representation. */
  toString(): string {
    return `${this.beats}/${this.noteValue}`;
  }

  /** Returns true if both time signatures are identical. */
  equals(that: TimeSignature) {
    return this.beats === that.beats && this.noteValue === that.noteValue;
  }
}
