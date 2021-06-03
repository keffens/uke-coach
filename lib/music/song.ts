import { Bar } from "./bar";
import { InstrumentLib } from "./instrument_lib";
import { SongMetadata } from "./metadata";
import { Pattern } from "./pattern";
import { SongPart } from "./song_part";
import { Token } from "./token";

export class Song {
  constructor(
    public metadata: SongMetadata,
    public patterns: Map<string, Pattern>,
    public parts: SongPart[],
    public instrumentLib: InstrumentLib
  ) {}

  static fromTokens(env: Token) {
    const metadata = SongMetadata.fromTokens(env);
    const patterns = new Map<string, Pattern>();
    const instrumentLib = new InstrumentLib();
    const parts = SongPart.fromTokens(env, metadata, patterns, instrumentLib);
    return new Song(metadata, patterns, parts, instrumentLib);
  }

  /** Returns all bars of the parts. */
  get bars(): Array<Bar> {
    return this.parts.map((p) => p.bars).reduce((a, b) => a.concat(b), []);
  }

  /** Returns the number of bars in all parts. */
  get barsLength(): number {
    return this.parts.map((p) => p.barsLength).reduce((a, b) => a + b, 0);
  }
}
