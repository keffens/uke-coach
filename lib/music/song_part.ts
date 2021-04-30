import { BarParagraph, BarParagraphBuilder } from "./bar";
import { PartMetadata, SongMetadata } from "./metadata";
import { Pattern } from "./pattern";
import { Token, TokenType } from "./token";

export enum SongPartType {
  None = "",
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
    fallback: SongMetadata | PartMetadata,
    patterns: Map<string, Pattern>,
    parts?: SongPart[],
    activePattern?: Pattern
  ): SongPart[] {
    if (!isSongPartType(env.key)) {
      throw new Error(`"${env.key}" is not a valid song part type.`);
    }
    parts = parts ?? new Array<SongPart>();
    const type = env.key as SongPartType;
    const name = env.value;
    const metadata = PartMetadata.fromTokens(env, name, fallback);
    activePattern = activePattern?.time.equals(metadata.time)
      ? activePattern
      : Pattern.makeDefault(metadata.time);
    let builder = new BarParagraphBuilder(activePattern);
    let paragraphs = null;

    for (let token of env.children) {
      switch (token.type) {
        case TokenType.StartEnv:
          if (isSongPartType(token.key)) {
            paragraphs = builder.build();
            if (paragraphs) {
              parts.push(new SongPart(type, metadata, paragraphs));
            }
            SongPart.fromTokens(
              token,
              metadata,
              patterns,
              parts,
              activePattern
            );
            builder = new BarParagraphBuilder(activePattern);
          } else {
            console.log("Ignoring environment:", token);
          }
          break;
        case TokenType.Pattern:
          activePattern = Pattern.fromToken(token, metadata.time, patterns);
          builder.switchPattern(activePattern);
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

  /** Returns the number of bars. */
  get bars(): number {
    return this.paragraphs.map((p) => p.bars.length).reduce((a, b) => a + b, 0);
  }

  /** Returns the number of beats in all bars. */
  get allBeats(): number {
    return this.bars * this.metadata.time.beats;
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
}
