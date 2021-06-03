import { assert, escapeRegExp } from "../util";
import { ChordLib } from "./chord_lib";
import { getDefaultSound, InstrumentType, SoundType } from "./instrument_type";
import { PitchedNote, PITCHED_NOTE_PATTERN } from "./note";

// TODO: escape instrument types for regex
// https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
export const INSTRUMENT_RE = new RegExp(
  String.raw`^(\w[-\(\) \w]*)\s+` +
    String.raw`(${Object.values(InstrumentType)
      .map((type) => escapeRegExp(type))
      .join("|")})` +
    String.raw`(?:\s+tuning((?:\s+${PITCHED_NOTE_PATTERN})+))?` +
    String.raw`(?:\s+(${Object.values(SoundType).join("|")}))?$`
);

/**
 * Represents one instrument with chord library and information which sampler to
 * use for audio playback.
 */
export class Instrument {
  readonly chordLib: ChordLib;
  readonly sound: SoundType;

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
}
