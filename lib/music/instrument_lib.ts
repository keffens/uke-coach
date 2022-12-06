import { assert } from "../util";
import { Instrument } from "./instrument";
import { InstrumentType } from "./instrument_type";
import {
  getPatternInstrumentAnnotation,
  getPatternString,
  Pattern,
} from "./pattern";
import { TimeSignature } from "./signature";
import { Token, TokenType } from "./token";

/** Library holding all instruments for a song. */
export class InstrumentLib {
  instruments = new Array<Instrument>();

  /** If not all of the active patterns are set, returns an empty array. */
  get activePatterns(): Pattern[] {
    const patterns = [];
    for (const instrument of this.instruments) {
      if (!instrument.activePattern) return [];
      patterns.push(instrument.activePattern);
    }
    return patterns;
  }

  get length(): number {
    return this.instruments.length;
  }

  /**
   * Adds an instrument. The first added instrument is chosen as default
   * instrument.
   */
  addInstrument(instrument: Instrument): void {
    assert(instrument.name, "Cannot add an instrument without a name");
    assert(
      !this.getInstrument(instrument.name),
      `An instrument with name "${instrument.name}" already exists`
    );
    this.instruments.push(instrument);
  }

  /**
   * Returns the requested instrument. If name is empty, returns the default
   * instrument.
   */
  getInstrument(name: string | null): Instrument | null {
    return this.instruments.find((inst) => inst.name === name) ?? null;
  }

  /**
   * Returns the default instrument. If no default instrument exists, creates
   * a ukulele as default.
   */
  getDefault(): Instrument {
    if (this.instruments.length === 0) {
      this.addInstrument(
        new Instrument(InstrumentType.Ukulele, InstrumentType.Ukulele)
      );
    }
    return this.instruments[0];
  }

  /**
   * Parses chord definition, pattern, tab, instrument, and instrument
   * environment tokens. If an instrument is given, only updates this
   * instrument.
   */
  parseToken(token: Token, time: TimeSignature, instrument?: Instrument): void {
    if (token.type === TokenType.Pattern && !getPatternString(token)) {
      this.setActivePattern(
        token.key,
        this.getInstrument(getPatternInstrumentAnnotation(token)) || instrument
      );
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
      case TokenType.InstrumentEnv:
        this.parseInstrumentEnv(token, time);
        break;
      case TokenType.Instrument:
        const inst = Instrument.fromToken(token);
        inst.setPattern(Pattern.makeEmpty(time));
        this.addInstrument(inst);
        break;
      case TokenType.Paragraph:
      case TokenType.LineBreak:
        break;
      default:
        throw token.error("Expected pattern, tab or chord definition");
    }
  }

  /**
   * Tokenizes the intstrument library including all patterns and custom chords.
   */
  tokenize(): Token[] {
    const tokens = [];
    for (const instrument of this.instruments) {
      tokens.push(instrument.tokenize());
    }
    tokens.push(Token.Paragraph());

    for (const instrument of this.instruments) {
      let env = tokens;
      if (this.instruments.length >= 2) {
        const envToken = new Token(
          TokenType.InstrumentEnv,
          "instrument",
          instrument.name
        );
        tokens.push(envToken);
        env = envToken.children;
      }

      env.push(...instrument.chordLib.tokenize());
      for (const [i, pattern] of instrument.getPatterns().entries()) {
        env.push(pattern.tokenize());
        if (env.at(-1)?.type === TokenType.Pattern) {
          env.push(Token.LineBreak());
        }
      }

      tokens.push(Token.Paragraph());
    }
    return tokens;
  }

  private parseInstrumentEnv(env: Token, time: TimeSignature): void {
    assert(env.value, env.errorMsg("Expected instrument name"));
    let instrument = this.getInstrument(env.value);
    assert(instrument, env.errorMsg(`Instrument ${env.value} is not defined`));
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
    // instruments. Ensure at least the default instrument is defined.
    this.getDefault();
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
    instrument?: Instrument | null
  ): void {
    const pattern = Pattern.fromToken(token, time);
    instrument =
      this.getInstrument(getPatternInstrumentAnnotation(token)) || instrument;
    if (instrument) {
      instrument.setPattern(pattern);
      return;
    }

    // If no instrument is explicitely selected, add to all compatible
    // instruments. Ensure at least the default instrument is defined.
    this.getDefault();
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
