import { setUnion } from "../util";
import { Bar } from "./bar";
import { BarParagraph } from "./bar_paragraph";
import { BarParagraphBuilder } from "./bar_paragraph_builder";
import { InstrumentLib } from "./instrument_lib";
import { PartMetadata, SongMetadata } from "./metadata";
import { Pattern } from "./pattern";
import { Token, TokenType } from "./token";

export enum SongPartType {
  None = "",
  Song = "song",
  Chorus = "chorus",
  Verse = "verse",
  Bridge = "bridge",
}

const VALID_TYPES = new Set<string>(Object.values(SongPartType));

export function isSongPartType(type?: string) {
  return VALID_TYPES.has(type ?? "");
}

export class SongPart {
  constructor(
    public type: SongPartType,
    public metadata: PartMetadata,
    public paragraphs: BarParagraph[]
  ) {}

  static fromTokens(
    env: Token,
    parentMetadata: SongMetadata | PartMetadata,
    instrumentLib: InstrumentLib,
    parts?: SongPart[]
  ): SongPart[] {
    if (!isSongPartType(env.key)) {
      throw new Error(`"${env.key}" is not a valid song part type.`);
    }
    parts = parts ?? new Array<SongPart>();
    const type = env.key as SongPartType;
    const name = env.value;
    const metadata = PartMetadata.fromTokens(env, parentMetadata, name);
    let builder = new BarParagraphBuilder(
      instrumentLib.activePatterns,
      metadata.time
    );
    let paragraphs = null;

    for (let token of env.children) {
      switch (token.type) {
        case TokenType.StartEnv:
          if (isSongPartType(token.key)) {
            paragraphs = builder.build();
            if (paragraphs) {
              parts.push(new SongPart(type, metadata, paragraphs));
            }
            SongPart.fromTokens(token, metadata, instrumentLib, parts);
            builder = new BarParagraphBuilder(
              instrumentLib.activePatterns,
              metadata.time
            );
          } else {
            console.log("Ignoring environment:", token);
          }
          break;
        case TokenType.TabEnv:
        case TokenType.Pattern:
        case TokenType.InstrumentEnv:
          instrumentLib.parseToken(token, metadata.time);
          builder.switchPattern(instrumentLib.activePatterns);
          break;
        case TokenType.ChordDefinition:
        case TokenType.Instrument:
          instrumentLib.parseToken(token, metadata.time);
          break;
        case TokenType.Chord:
          builder.addChord(token.value);
          break;
        case TokenType.Text:
          builder.addLyrics(token.value);
          break;
        case TokenType.LineBreak:
          builder.newLine();
          break;
        case TokenType.Paragraph:
          builder.newParagraph();
          break;
        case TokenType.Metadata:
          break;
        default:
          console.log("Ignoring token:", token);
      }
    }
    paragraphs = builder.build();
    if (paragraphs) {
      parts.push(new SongPart(type, metadata, paragraphs));
    }
    return parts;
  }

  get header() {
    if (this.metadata.name) return this.metadata.name;
    switch (this.type) {
      case SongPartType.Chorus:
        return "Chorus";
      case SongPartType.Verse:
        return "Verse";
      case SongPartType.Bridge:
        return "Bridge";
      default:
        return null;
    }
  }

  /** Returns all bars of the parts. */
  get bars(): Array<Bar> {
    return this.paragraphs.map((p) => p.bars).reduce((a, b) => a.concat(b), []);
  }

  /** Returns the number of bars. */
  get barsLength(): number {
    return this.paragraphs.map((p) => p.bars.length).reduce((a, b) => a + b, 0);
  }

  /** Returns the number of beats in all bars. */
  get allBeats(): number {
    return this.barsLength * this.metadata.time.beats;
  }

  /** Returns the duration of this song part in milliseconds. */
  get duration(): number {
    return (this.allBeats * 60000) / this.metadata.tempo;
  }

  /** Returns the duration of this song part in seconds. */
  get durationSec(): number {
    return this.duration / 1000;
  }

  /** Returns the duration of on bar in milliseconds. */
  get barDuration(): number {
    return (this.metadata.time.beats * 60000) / this.metadata.tempo;
  }

  /** Returns the duration of on bar in seconds. */
  get barDurationSec(): number {
    return this.barDuration / 1000;
  }

  /** Returns the maximum number that any pattern has in this part. */
  get maxStrumsPerBar(): number {
    return Math.max(...this.paragraphs.map((p) => p.maxStrumsPerBar));
  }

  /** Tokenizes the song part. */
  tokenize(
    parentMetadata: SongMetadata | PartMetadata,
    instrumentLib: InstrumentLib
  ): Token[] {
    const children = [];
    children.push(...this.metadata.tokenize(parentMetadata));

    const activePatternsInOut = new Array<Pattern | null>(
      this.paragraphs[0].height
    ).fill(null);
    for (const paragraph of this.paragraphs) {
      if (children.length) {
        children.push(Token.Paragraph());
      }
      children.push(...paragraph.tokenize(instrumentLib, activePatternsInOut));
    }

    if ([SongPartType.None, SongPartType.Song].includes(this.type)) {
      return children;
    }
    return [
      new Token(TokenType.StartEnv, this.type, this.metadata.name, children),
    ];
  }

  /** Highlights the specified bar. Any negative value clears all highlights. */
  highlightBar(idx: number): void {
    this.bars.forEach((bar, i) => {
      bar.highlight = idx === i;
    });
  }

  /**
   * Returns the patterns used in this part for the given instrument.
   */
  usedPatterns(instrumentIdx: number): Set<Pattern> {
    return setUnion(
      ...this.paragraphs.map((p) => p.usedPatterns(instrumentIdx))
    );
  }

  /** Returns the chords used by the given instrument.*/
  usedChords(instrumentIdx: number): Set<string> {
    return setUnion(...this.paragraphs.map((p) => p.usedChords(instrumentIdx)));
  }
}
