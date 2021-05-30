import { assert } from "../util";
import { ChordLib } from "./chord_lib";
import { getDefaultSound, InstrumentType, SoundType } from "./instrument_type";
import { PitchedNote } from "./note";

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
      tuning?.length || type !== InstrumentType.Custom,
      'If instrument is "custom", strings must be specified'
    );
    this.chordLib = ChordLib.for(type, tuning);
    this.sound = sound ?? getDefaultSound(type);
  }

  /** Returns the tuning of the instrument. */
  get tuning(): PitchedNote[] {
    return this.chordLib.tuning;
  }
}
