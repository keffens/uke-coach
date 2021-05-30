import { assert } from "../util";
import { Instrument } from "./instrument";
import { InstrumentType, SoundType } from "./instrument_type";
import { PitchedNote } from "./note";

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
    assert(
      !this.instruments.get(name),
      `An instrument with name "${name}" already exists`
    );
    this.instruments.set(name, new Instrument(name, type, sound, tuning));
  }

  /** Creates a ukulele as default instrument if no instrument exists. */
  addDefaultIfEmpty(): void {
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
