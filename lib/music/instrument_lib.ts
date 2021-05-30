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

/** Library holding all instruments for a song. */
export class InstrumentLib {
  private defaultInstrument: string | null = null;
  private instruments = new Map<string, Instrument>();

  /**
   * Adds an instrument. The first added instrument is chosen as default
   * instrument.
   */
  addInstrument(
    name: string,
    type: InstrumentType,
    sound?: SoundType,
    tuning?: PitchedNote[]
  ): void {
    if (!this.defaultInstrument) this.defaultInstrument = name;
    this.instruments.set(name, new Instrument(name, type, sound, tuning));
  }

  /** Creates a ukulele as default instrument if no instrument exists. */
  createDefaultIfEmpty() {
    if (this.defaultInstrument) return;
    this.addInstrument("ukulele", InstrumentType.Ukulele);
  }

  /** Returns the requested instrument. */
  getInstrument(name: string): Instrument {
    const instrument = this.instruments.get(name);
    assert(instrument, `Instrument "${name}" is not defined`);
    return instrument;
  }

  /** Returns the default instrument. */
  getDefault(): Instrument {
    assert(this.defaultInstrument, "No default instrument specified");
    return this.getInstrument(this.defaultInstrument);
  }
}
