import { Bar } from "./bar";
import { InstrumentLib } from "./instrument_lib";
import { Pattern } from "./pattern";
import { SongMetadata } from "./metadata";
import { SongPart } from "./song_part";
import { Token, TokenType } from "./token";
import { delUndefined, setUnion } from "../util";
import { SongData } from "../firebase";

export class Song {
  constructor(
    public metadata: SongMetadata,
    public parts: SongPart[],
    public instrumentLib: InstrumentLib
  ) {
    for (let i = 0; i < instrumentLib.length; i++) {
      instrumentLib.instruments[i].filterPatterns(this.usedPatterns(i));
      instrumentLib.instruments[i].chordLib.usedChords = this.usedChords(i);
    }
  }

  static fromTokens(env: Token) {
    const metadata = SongMetadata.fromTokens(env);
    const instrumentLib = new InstrumentLib();
    const parts = SongPart.fromTokens(env, metadata, instrumentLib);
    return new Song(metadata, parts, instrumentLib);
  }

  /** Converts the song back to tokens for storage. */
  tokenize(): Token {
    const env = new Token(TokenType.StartEnv, "song");
    env.children.push(...this.metadata.tokenize());
    env.children.push(Token.Paragraph());
    env.children.push(...this.instrumentLib.tokenize());
    env.children.push(Token.Paragraph());
    for (const part of this.parts) {
      env.children.push(...part.tokenize(this.metadata, this.instrumentLib));
      env.children.push(Token.Paragraph());
    }
    return env;
  }

  /** Returns a SongData object with added fields from song metadata. */
  toSongData(
    id: string,
    ownerId: string,
    chordPro: string,
    deployed = false
  ): SongData {
    // TODO: supplying ChordPro is optional once `tokenize` is working.
    return delUndefined({
      artist: this.metadata.artist,
      chordPro,
      deployed,
      id,
      ownerId,
      sorttitle: this.metadata.sorttitle,
      title: this.metadata.title,
    });
  }

  /** Returns all bars of the parts. */
  get bars(): Array<Bar> {
    return this.parts.map((p) => p.bars).reduce((a, b) => a.concat(b), []);
  }

  /** Returns the number of bars in all parts. */
  get barsLength(): number {
    return this.parts.map((p) => p.barsLength).reduce((a, b) => a + b, 0);
  }

  /** Returns the maximum number that any pattern has in this song. */
  get maxStrumsPerBar(): number {
    return Math.max(...this.parts.map((p) => p.maxStrumsPerBar));
  }

  /**
   * Returns the patterns used in this part for the given instrument.
   */
  usedPatterns(instrumentIdx: number): Set<Pattern> {
    return setUnion(...this.parts.map((p) => p.usedPatterns(instrumentIdx)));
  }

  /** Returns the chords used by the given instrument.*/
  usedChords(instrumentIdx: number): Set<string> {
    return setUnion(...this.parts.map((p) => p.usedChords(instrumentIdx)));
  }

  /**
   * Highlights the specified bar. Any negative value for either input clears
   * all highlights.
   */
  highlightPart(partIdx: number, barIdx = 0): void {
    this.parts.forEach((part, i) => {
      part.highlightBar(partIdx === i ? barIdx : -1);
    });
  }
}
