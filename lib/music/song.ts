import { SongMetadata } from "./metadata";
import { Pattern } from "./pattern";
import { SongPart } from "./song_part";
import { Token, TokenType } from "./token";

export class Song {
  constructor(
    public metadata: SongMetadata,
    public patterns: Map<string, Pattern>,
    public parts: SongPart[]
  ) {}

  static fromTokens(env: Token) {
    const metadata = SongMetadata.fromTokens(env);
    const patterns = new Map<string, Pattern>();
    const parts = SongPart.fromTokens(env, metadata, patterns);
    return new Song(metadata, patterns, parts);
  }
}
