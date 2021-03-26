import {
  DEFAULT_TIME_SIGNATURE,
  KeySignature,
  TimeSignature,
} from "./signature";
import { Token, TokenType } from "./token";

function populateMap(tokens: Token[]) {
  const metadata = new Map<string, string>();
  let envLevel = 0;
  for (const token of tokens) {
    if (token.type === TokenType.StartEnv) {
      envLevel++;
    } else if (token.type === TokenType.EndEnv) {
      if (envLevel === 0) {
        throw new Error(
          "There are more closing environment directives than opening " +
            "environment directives"
        );
      }
      envLevel--;
    } else if (token.type === TokenType.Metadata && envLevel === 0) {
      if (metadata.get(token.key)) {
        throw new Error(`Metadata "${token.key}" is defined twice.`);
      }
      metadata.set(token.key, token.value);
    }
  }
  return metadata;
}

export class SongMetadata {
  constructor(
    public title: string,
    public sorttitle?: string,
    public subtitle?: string,
    public artist?: string,
    public composer?: string,
    public lyricist?: string,
    public copyright?: string,
    public album?: string,
    public year?: number,
    public key?: KeySignature,
    public time?: TimeSignature,
    public tempo?: number,
    public capo?: number
  ) {}

  static fromTokens(tokens: Token[]) {
    const metadata = populateMap(tokens);
    if (!metadata.get("title")) {
      throw new Error("The song metadata does not have a title.");
    }
    return new SongMetadata(
      metadata.get("title"),
      metadata.get("sorttitle"),
      metadata.get("subtitle"),
      metadata.get("artist"),
      metadata.get("composer"),
      metadata.get("lyricist"),
      metadata.get("copyright"),
      metadata.get("album"),
      parseInt(metadata.get("year")) || undefined,
      metadata.get("key") ? KeySignature.parse(metadata.get("key")) : undefined,
      metadata.get("time")
        ? TimeSignature.parse(metadata.get("time"))
        : DEFAULT_TIME_SIGNATURE,
      parseInt(metadata.get("tempo")) || undefined,
      parseInt(metadata.get("capo")) || undefined
    );
  }
}

export class PartMetadata {
  constructor(
    public name?: string,
    public key?: KeySignature,
    public time?: TimeSignature,
    public tempo?: number,
    public capo?: number
  ) {}

  static fromTokens(
    tokens: Token[],
    name?: string,
    fallback?: SongMetadata | PartMetadata
  ) {
    const metadata = populateMap(tokens);
    return new PartMetadata(
      name,
      metadata.get("key")
        ? KeySignature.parse(metadata.get("key"))
        : fallback?.key,
      metadata.get("time")
        ? TimeSignature.parse(metadata.get("time"))
        : fallback?.time,
      parseInt(metadata.get("tempo")) || fallback?.tempo,
      parseInt(metadata.get("capo")) || fallback?.capo
    );
  }
}

export const SONG_METADATA_KEYS = new Set(Object.keys(new SongMetadata("")));
