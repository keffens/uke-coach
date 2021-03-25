import { SongMetadata, Token, TokenType } from ".";

export class Song {
  constructor(public metadata: SongMetadata) {}

  static fromTokens(tokens: Token[]) {
    const metadata = SongMetadata.fromTokens(tokens);
    return new Song(metadata);
  }
}
