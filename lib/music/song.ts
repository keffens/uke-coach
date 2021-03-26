import { SongMetadata } from "./metadata";
import { SongPart, SongPartType, isSongPartType } from "./song_part";
import { Token } from "./token";
import { splitByEnvironment } from "./tokenizer";

export class Song {
  constructor(public metadata: SongMetadata, public parts: SongPart[]) {}

  static fromTokens(tokens: Token[]) {
    const metadata = SongMetadata.fromTokens(tokens);
    const envs = splitByEnvironment(tokens);
    const parts = new Array<SongPart>();
    for (let env of envs) {
      if (!isSongPartType(env.startToken.key)) continue;
      const part = SongPart.fromTokens(
        env.tokens,
        env.startToken.key as SongPartType,
        env.startToken.value,
        metadata
      );
      if (!part.isEmpty()) {
        parts.push(part);
      }
    }
    return new Song(metadata, parts);
  }
}
