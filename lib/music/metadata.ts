import { assert } from "../util";
import { KeySignature, TimeSignature } from "./signature";
import { Token, TokenType } from "./token";

function populateMap(tokens: Token[]) {
  const metadata = new Map<string, string>();
  for (const token of tokens) {
    if (token.type === TokenType.Metadata) {
      assert(
        !metadata.get(token.key),
        `Metadata "${token.key}" is defined twice.`
      );
      metadata.set(token.key, token.value);
    }
  }
  return metadata;
}

function addToken(
  tokens: Token[],
  key: string,
  value?: string | number,
  parentValue?: string | number
) {
  if (
    !value ||
    value === parentValue ||
    (typeof value === "number" && isNaN(value))
  ) {
    return;
  }
  tokens.push(new Token(TokenType.Metadata, key, `${value}`));
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
    public tempo = 120,
    public capo = 0
  ) {}

  static fromTokens(env: Token) {
    const metadata = populateMap(env.children);
    assert(metadata.get("title"), "The song metadata does not have a title.");
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

  tokenize(): Token[] {
    assert(this.title, "The song metadata does not have a title.");
    const tokens = new Array<Token>();
    addToken(tokens, "title", this.title);
    addToken(tokens, "sorttitle", this.sorttitle);
    addToken(tokens, "subtitle", this.subtitle);
    addToken(tokens, "artist", this.artist);
    addToken(tokens, "composer", this.composer);
    addToken(tokens, "lyricist", this.lyricist);
    addToken(tokens, "copyright", this.copyright);
    addToken(tokens, "album", this.album);
    addToken(tokens, "year", this.year);
    addToken(tokens, "key", this.key?.toString());
    addToken(tokens, "time", this.time.toString());
    addToken(tokens, "tempo", this.tempo);
    addToken(tokens, "capo", this.capo);
    return tokens;
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
    assert(tempo > 0, "The song part requires a tempo.");
    return new PartMetadata(
      tempo,
      metadata.get("time")
        ? TimeSignature.parse(metadata.get("time")!)
        : parentMetadata.time,
      name,
      metadata.get("key")
        ? KeySignature.parse(metadata.get("key")!)
        : parentMetadata?.key
    );
  }

  tokenize(parentMetadata: SongMetadata | PartMetadata): Token[] {
    const tokens = new Array<Token>();
    addToken(
      tokens,
      "key",
      this.key?.toString(),
      parentMetadata.key?.toString()
    );
    addToken(
      tokens,
      "time",
      this.time.toString(),
      parentMetadata.time.toString()
    );
    addToken(tokens, "tempo", this.tempo, parentMetadata.tempo);
    return tokens;
  }
}

export const SONG_METADATA_KEYS = new Set(Object.keys(new SongMetadata("")));
