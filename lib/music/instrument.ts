import { assert, escapeRegExp } from "../util";
import { ChordLib } from "./chord_lib";
import {
  getDefaultSound,
  InstrumentType,
  isDefaultTuning,
  SoundType,
} from "./instrument_type";
import { PitchedNote, PITCHED_NOTE_PATTERN } from "./note";
import { Pattern } from "./pattern";
import { StrumType } from "./strum";
import { Token, TokenType } from "./token";

export const INSTRUMENT_RE = new RegExp(
  String.raw`^(\w[-\(\) \w]*)\s+` +
    String.raw`\[?(${Object.values(InstrumentType)
      .map((type) => escapeRegExp(type))
      .join("|")})\]?` +
    String.raw`(?:\s+tuning((?:\s+${PITCHED_NOTE_PATTERN})+))?` +
    String.raw`(?:\s+(${Object.values(SoundType).join("|")}))?$`
);

/** Supported volume settings for playback. */
export enum VolumeSetting {
  High,
  Low,
  Mute,
}

/** Returns the next volume state. */
export function toggleVolume(vol: VolumeSetting): VolumeSetting {
  switch (vol) {
    case VolumeSetting.High:
      return VolumeSetting.Low;
    case VolumeSetting.Low:
      return VolumeSetting.Mute;
    case VolumeSetting.Mute:
      return VolumeSetting.High;
  }
}

/**
 * Represents one instrument with chord library and information which sampler to
 * use for audio playback.
 */
export class Instrument {
  volume = VolumeSetting.High;
  show = true;
  readonly chordLib: ChordLib;
  readonly sound: SoundType;
  private patterns = new Map<string, Pattern>();
  private activePatternVar: Pattern | null = null;

  constructor(
    readonly name: string,
    readonly type: InstrumentType,
    sound?: SoundType,
    tuning?: PitchedNote[]
  ) {
    assert(
      tuning?.length || type !== InstrumentType.CustomStrings,
      'If instrument is "custom", strings must be specified'
    );
    this.chordLib = ChordLib.for(type, tuning);
    this.sound = sound ?? getDefaultSound(type);
  }

  /** Returns the tuning of the instrument. */
  get tuning(): PitchedNote[] {
    return this.chordLib.tuning;
  }

  /** Returns the active pattern. */
  get activePattern(): Pattern | null {
    return this.activePatternVar;
  }

  /** Returns all patterns or only the main patterns */
  getPatterns(onlyMain: boolean = false): Array<Pattern> {
    if (onlyMain) {
      return [...this.patterns.values()].filter((pattern) =>
        pattern.isMainPattern()
      );
    }
    return [...this.patterns.values()];
  }

  /** Remove all patterns which are not in the given list of patterns. */
  filterPatterns(filter: Set<Pattern>): void {
    for (const [name, pattern] of this.patterns.entries()) {
      if (!filter.has(pattern)) {
        this.patterns.delete(name);
      }
    }
  }

  /** Parses an instrument from a string. */
  static parse(text: string): Instrument {
    const match = text.match(INSTRUMENT_RE);
    assert(match, `Failed to parse instrument from string "${text}"`);
    const name = match[1].trim();
    const type = match[2] as InstrumentType;
    const sound = (match[4] as SoundType) || undefined;
    let tuning = undefined;
    if (match[3]) {
      tuning = match[3]
        .trim()
        .split(/\s+/)
        .map((s) => PitchedNote.parse(s));
    }
    return new Instrument(name, type, sound, tuning);
  }

  /** Parses and instrument from a token. */
  static fromToken(token: Token): Instrument {
    assert(
      token.type === TokenType.Instrument,
      `Expected token of type Instrument, got ${token.type}`
    );
    try {
      return Instrument.parse(token.value);
    } catch (e) {
      if (e instanceof Error) throw token.error(e.message);
      throw e;
    }
  }

  /** Returns the corresponding instrument token. */
  tokenize(): Token {
    const parts = [this.name, this.type];
    if (!isDefaultTuning(this.type, this.tuning)) {
      parts.push("tuning", ...this.tuning.map((n) => n.toString()));
    }
    if (this.sound != getDefaultSound(this.type)) parts.push(this.sound);
    return new Token(TokenType.Instrument, "", parts.join(" "));
  }

  /**
   * Adds a pattern if it is a named pattern, possibly overwriting previous
   * definitions of the pattern.
   */
  setPattern(pattern: Pattern): void {
    assert(
      this.isCompatiblePattern(pattern),
      `Pattern ${pattern.toString()} is not compatible with instrument ` +
        this.name
    );
    this.activePatternVar = pattern;
    if (pattern.name) {
      this.patterns.set(pattern.name, pattern);
    }
  }

  /**
   * Adds the given pattern if it is compatible and not yet in the pattern list.
   * Returns true if the pattern was added.
   */
  setPatternIfCompatible(pattern: Pattern): boolean {
    if (!this.patterns.has(pattern.name) && this.isCompatiblePattern(pattern)) {
      this.activePatternVar = pattern;
      if (pattern.name) {
        this.patterns.set(pattern.name, pattern);
      }
      return true;
    }
    return false;
  }

  /** Sets the active pattern. */
  setActivePattern(name: string): void {
    assert(
      this.patterns.has(name),
      `Pattern "${name}" not defined for instrument ${this.name}`
    );
    this.activePatternVar = this.patterns.get(name)!;
  }

  /** Sets the active pattern if it is defined. Returns true if successful. */
  setActivePatternIfDefined(name: string): boolean {
    if (this.patterns.has(name)) {
      this.activePatternVar = this.patterns.get(name)!;
      return true;
    }
    return false;
  }

  private isCompatiblePattern(pattern: Pattern): boolean {
    for (const strum of pattern.strums) {
      if (
        (strum.type === StrumType.Plugged &&
          strum.strings.some((s) => s > this.tuning.length)) ||
        (strum.type === StrumType.Tab &&
          strum.frets.length !== this.tuning.length)
      ) {
        return false;
      }
    }
    return true;
  }
}
