import { Token } from ".";
import { TokenType } from "./token";

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
    public key?: string,
    public time = "4/4",
    public tempo?: number,
    public capo?: number
  ) {}

  static fromTokens(tokens: Token[]) {
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
        metadata.set(token.key, token.value);
      }
    }
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
      metadata.get("key"),
      metadata.get("time") || "4/4",
      parseInt(metadata.get("tempo")) || undefined,
      parseInt(metadata.get("capo")) || undefined
    );
  }
}

export const SONG_METADATA_KEYS = new Set(Object.keys(new SongMetadata("")));
