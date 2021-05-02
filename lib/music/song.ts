import { ChordLib } from "./chord_lib";
import { SongMetadata } from "./metadata";
import { Pattern } from "./pattern";
import { SongPart } from "./song_part";
import { Token } from "./token";

export class Song {
  constructor(
    public metadata: SongMetadata,
    public patterns: Map<string, Pattern>,
    public parts: SongPart[],
    public chordLib = ChordLib.forUkulele()
  ) {}

  static fromTokens(env: Token) {
    const metadata = SongMetadata.fromTokens(env);
    const patterns = new Map<string, Pattern>();
    const parts = SongPart.fromTokens(env, metadata, patterns);
    return new Song(metadata, patterns, parts);
  }

  /** Returns the number of bars in all parts. */
  get bars(): number {
    return this.parts.map((p) => p.bars).reduce((a, b) => a + b, 0);
  }
}
