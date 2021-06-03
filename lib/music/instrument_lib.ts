import { assert } from "../util";
import { Instrument } from "./instrument";
import { InstrumentType } from "./instrument_type";

/** Library holding all instruments for a song. */
export class InstrumentLib {
  private defaultInstrument: string | null = null;
  private instrumentsMap = new Map<string, Instrument>();

  /** Returns all instruments in this library. */
  get instruments(): Iterable<Instrument> {
    return this.instrumentsMap.values();
  }

  /**
   * Adds an instrument. The first added instrument is chosen as default
   * instrument.
   */
  addInstrument(instrument: Instrument): void {
    if (this.defaultInstrument == null) {
      this.defaultInstrument = instrument.name;
    }
    assert(
      !this.instrumentsMap.get(instrument.name),
      `An instrument with name "${instrument.name}" already exists`
    );
    this.instrumentsMap.set(instrument.name, instrument);
  }

  /** Returns the requested instrument. */
  getInstrument(name: string): Instrument {
    const instrument = this.instrumentsMap.get(name);
    assert(instrument, `Instrument "${name}" is not defined`);
    return instrument;
  }

  /**
   * Returns the default instrument. If no default instrument exists, creates
   * a ukulele as default.
   */
  getDefault(): Instrument {
    if (!this.defaultInstrument) {
      this.addInstrument(
        new Instrument(InstrumentType.Ukulele, InstrumentType.Ukulele)
      );
    }
    return this.getInstrument(this.defaultInstrument!);
  }
}
