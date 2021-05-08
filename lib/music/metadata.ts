import { KeySignature, TimeSignature } from "./signature";
import { Token, TokenType } from "./token";

function populateMap(tokens: Token[]) {
  const metadata = new Map<string, string>();
  for (const token of tokens) {
    if (token.type === TokenType.Metadata) {
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
    public sorttitle = "",
    public subtitle = "",
    public artist = "",
    public composer = "",
    public lyricist = "",
    public copyright = "",
    public album = "",
    public year = NaN,
    public key: KeySignature | null = null,
    public time = TimeSignature.DEFAULT,
    public tempo = NaN,
    public capo = 0
  ) {}

  static fromTokens(env: Token) {
    const metadata = populateMap(env.children);
    if (!metadata.get("title")) {
      throw new Error("The song metadata does not have a title.");
    }
    return new SongMetadata(
      metadata.get("title")!,
      metadata.get("sorttitle"),
      metadata.get("subtitle"),
      metadata.get("artist"),
      metadata.get("composer"),
      metadata.get("lyricist"),
      metadata.get("copyright"),
      metadata.get("album"),
      parseInt(metadata.get("year") ?? "") || undefined,
      metadata.get("key") ? KeySignature.parse(metadata.get("key")!) : null,
      metadata.get("time")
        ? TimeSignature.parse(metadata.get("time")!)
        : TimeSignature.DEFAULT,
      parseInt(metadata.get("tempo") ?? "") || undefined,
      parseInt(metadata.get("capo") ?? "") || undefined
    );
  }
}

export class PartMetadata {
  constructor(
    public tempo: number,
    public time: TimeSignature,
    public name = "",
    public key: KeySignature | null = null
  ) {}

  static fromTokens(
    env: Token,
    parentMetadata: SongMetadata | PartMetadata,
    name = ""
  ) {
    const metadata = populateMap(env.children);
    const tempo =
      parseInt(metadata.get("tempo") ?? "") || parentMetadata?.tempo;
    if (!tempo || tempo < 0) {
      throw new Error("The song part requires a tempo.");
    }
    return new PartMetadata(
      tempo,
      parentMetadata.time,
      name,
      metadata.get("key")
        ? KeySignature.parse(metadata.get("key")!)
        : parentMetadata?.key
    );
  }
}

export const SONG_METADATA_KEYS = new Set(Object.keys(new SongMetadata("")));
