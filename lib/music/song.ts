import { Bar } from "./bar";
import { InstrumentLib } from "./instrument_lib";
import { Pattern } from "./pattern";
import { SongMetadata } from "./metadata";
import { SongPart } from "./song_part";
import { Token } from "./token";
import { setUnion } from "../util";

export class Song {
  constructor(
    public metadata: SongMetadata,
    public parts: SongPart[],
    public instrumentLib: InstrumentLib
  ) {
    for (let i = 0; i < instrumentLib.length; i++) {
      instrumentLib.instruments[i].filterPatterns(this.usedPatterns(i));
    }
  }

  static fromTokens(env: Token) {
    const metadata = SongMetadata.fromTokens(env);
    const instrumentLib = new InstrumentLib();
    const parts = SongPart.fromTokens(env, metadata, instrumentLib);
    return new Song(metadata, parts, instrumentLib);
  }

  /** Returns all bars of the parts. */
  get bars(): Array<Bar> {
    return this.parts.map((p) => p.bars).reduce((a, b) => a.concat(b), []);
  }

  /** Returns the number of bars in all parts. */
  get barsLength(): number {
    return this.parts.map((p) => p.barsLength).reduce((a, b) => a + b, 0);
  }

  /**
   * Returns the patterns used in this part for the given instrument.
   */
  usedPatterns(instrumentIdx: number): Set<Pattern> {
    return setUnion(...this.parts.map((p) => p.usedPatterns(instrumentIdx)));
  }
}
