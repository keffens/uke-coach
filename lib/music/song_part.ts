import { PartMetadata, SongMetadata } from "./metadata";
import { Token } from "./token";

export enum SongPartType {
  None = "",
  Chorus = "chorus",
  Verse = "verse",
  Bridge = "bridge",
}

const VALID_TYPES = new Set<string>(Object.values(SongPartType));

export function isSongPartType(type: string) {
  return VALID_TYPES.has(type);
}

export class SongPart {
  constructor(public type: SongPartType, public metadata: PartMetadata) {}

  static fromTokens(
    tokens: Token[],
    type: SongPartType,
    name?: string,
    fallback?: SongMetadata | PartMetadata
  ) {
    const metadata = PartMetadata.fromTokens(tokens, name, fallback);
    return new SongPart(type, metadata);
  }

  get header() {
    if (this.metadata.name) return this.metadata.name;
    switch (this.type) {
      case SongPartType.Chorus:
        return "Chorus";
      case SongPartType.Verse:
        return "Verse";
      case SongPartType.Bridge:
        return "Bridge";
      default:
        return null;
    }
  }

  isEmpty() {
    // TODO: Implement this.
    return false;
  }
}
