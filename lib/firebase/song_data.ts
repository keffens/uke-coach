import { assert } from "../util";

export interface SongData {
  id: string;
  ownerId: string;
  // Song metadata
  title: string;
  sorttitle?: string;
  artist?: string;
  composer?: string;
  lyricist?: string;
  copyright?: string;
  album?: string;
  year?: number;
  key?: string;
  time?: string;
  tempo?: number;

  // Serialized song
  chordPro: string;
}

export function toSongData(data: any): SongData {
  assert(
    typeof data.id === "string" &&
      typeof data.title === "string" &&
      typeof data.chordPro === "string",
    `Conversion to SongData failed`
  );
  return data as SongData;
}
