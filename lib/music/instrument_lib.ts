import { assert } from "../util";
import { Instrument } from "./instrument";
import { InstrumentType } from "./instrument_type";
import { Pattern } from "./pattern";
import { TimeSignature } from "./signature";
import { Token, TokenType } from "./token";

/** Library holding all instruments for a song. */
export class InstrumentLib {
  private defaultInstrument: string | null = null;
  private instrumentsMap = new Map<string, Instrument>();

  /** Returns all instruments in this library. */
  get instruments(): Iterable<Instrument> {
    return this.instrumentsMap.values();
  }

  get activePatterns(): Pattern[] {
    return [...this.instruments].map((inst) => inst.activePattern);
  }

  /**
   * Adds an instrument. The first added instrument is chosen as default
   * instrument.
   */
  addInstrument(instrument: Instrument): void {
    assert(instrument.name, "Cannot add an instrument without a name");
    if (this.defaultInstrument == null) {
      this.defaultInstrument = instrument.name;
    }
    assert(
      !this.instrumentsMap.get(instrument.name),
      `An instrument with name "${instrument.name}" already exists`
    );
    this.instrumentsMap.set(instrument.name, instrument);
  }

  /**
   * Returns the requested instrument. If name is empty, returns the default
   * instrument.
   */
  getInstrument(name?: string): Instrument {
    if (!name) return this.getDefault();
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

  /**
   * Parses chord definition, pattern, tab, instrument, and instrument
   * environment tokens. If an instrument is given, only updates this
   * instrument.
   */
  parseToken(token: Token, time: TimeSignature, instrument?: Instrument): void {
    if (token.type === TokenType.Pattern && !token.value) {
      this.setActivePattern(token.key, instrument);
      return;
    }
    switch (token.type) {
      case TokenType.TabEnv:
      case TokenType.Pattern:
        this.parsePattern(token, time, instrument);
        break;
      case TokenType.ChordDefinition:
        this.parseChord(token, instrument);
        break;
      case TokenType.StartEnv:
        this.parseInstrumentEnv(token, time);
        break;
      case TokenType.Instrument:
        this.addInstrument(Instrument.fromToken(token));
        break;
      default:
        throw token.error("Expected pattern, tab or chord definition");
    }
  }

  /**
   * Updates the library from the given instrument environment. Supports parsing
   * of chords and patterns, and setting patterns.
   */
  private parseInstrumentEnv(env: Token, time: TimeSignature): void {
    assert(env.key === "instrument", "Expected an instrument environment");
    assert(env.value, env.errorMsg("Expected instrument name"));
    let instrument;
    try {
      instrument = this.getInstrument(env.value);
    } catch (e) {
      throw env.error(e.message);
    }
    for (const token of env.children) {
      switch (token.type) {
        case TokenType.Pattern:
        case TokenType.ChordDefinition:
        case TokenType.TabEnv:
          this.parseToken(token, time, instrument);
          break;
        case TokenType.FileComment:
        case TokenType.LineBreak:
        case TokenType.Paragraph:
          break;
        default:
          throw token.error("Unsupported token in instrument environment");
      }
    }
  }

  private parseChord(token: Token, instrument?: Instrument): void {
    if (instrument) {
      instrument.chordLib.parseChord(token);
      return;
    }

    // If no instrument is explicitely selected, add to all compatible
    // instruments.
    let count = 0;
    for (const inst of this.instruments) {
      if (inst.chordLib.parseChord(token, /*assertCompatible=*/ false)) count++;
    }
    assert(
      count > 0,
      token.errorMsg(
        "Chord is not compatible with or already defined for all instruments"
      )
    );
  }

  private parsePattern(
    token: Token,
    time: TimeSignature,
    instrument?: Instrument
  ): void {
    const pattern = Pattern.fromToken(token, time);
    if (instrument) {
      instrument.setPattern(pattern);
      return;
    }

    // If no instrument is explicitely selected, add to all compatible
    // instruments.
    let count = 0;
    for (const inst of this.instruments) {
      if (inst.setPatternIfCompatible(pattern)) count++;
    }
    assert(
      count > 0,
      token.errorMsg(
        "Pattern is not compatible with or already defined for all instruments"
      )
    );
  }

  private setActivePattern(name: string, instrument?: Instrument) {
    if (instrument) {
      instrument.setActivePattern(name);
      return;
    }

    // If no instrument is explicitely selected, set for all instruments if
    // the pattern is defined.
    let count = 0;
    for (const inst of this.instruments) {
      if (inst.setActivePatternIfDefined(name)) count++;
    }
    assert(count > 0, `Pattern "${name}" is not defined for any instrument`);
  }
}
