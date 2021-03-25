import { Note, Scale } from ".";

const PARSE_KEY_RE = new RegExp(
  `^(${Object.values(Note).join("|")})(${Object.values(Scale).join("|")})$`
);

export class KeySignature {
  constructor(readonly note: Note, readonly scale: Scale) {}

  static parse(text: string) {
    const match = PARSE_KEY_RE.exec(text.trim());
    if (match == null) {
      throw new Error(`Failed to parse key signature from "${text}".`);
    }
    return new KeySignature(match[1] as Note, match[2] as Scale);
  }

  toString() {
    return `${this.note}${this.scale}`;
  }
}

export class TimeSignature {
  constructor(readonly beats: number, readonly noteValue: number) {}

  static parse(text: string) {
    const match = /^(\d+)\/(\d+)$/.exec(text.trim());
    const beats = parseInt(match?.[1]);
    const noteValue = parseInt(match?.[2]);
    if (!beats || beats <= 0 || !noteValue || noteValue <= 0) {
      throw new Error(`Failed to parse time signature from "${text}".`);
    }
    return new TimeSignature(beats, noteValue);
  }

  toString() {
    return `${this.beats}/${this.noteValue}`;
  }
}

export const DEFAULT_TIME_SIGNATURE = new TimeSignature(4, 4);
