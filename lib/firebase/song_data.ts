import { assert, delUndefined, isString, toStringOrUndef } from "../util";

export interface SongData {
  chordPro: string;
  id: string;
  ownerId: string;
  title: string;
  // Optional
  artist?: string;
  sorttitle?: string;
}

export function toSongData(data: any): SongData {
  assert(
    isString(data.id) &&
      isString(data.ownerId) &&
      isString(data.title) &&
      isString(data.chordPro),
    "Input cannot be converted to SongData",
    data
  );
  return delUndefined({
    chordPro: data.chordPro,
    id: data.id,
    ownerId: data.ownerId,
    title: data.title,
    sorttitle: toStringOrUndef(data.sorttitle),
    artist: toStringOrUndef(data.sorttitle),
  });
}

export function sortSongs(songs: SongData[]): SongData[] {
  return songs.sort((lhs, rhs) => {
    const titleComp = (lhs.sorttitle || lhs.title).localeCompare(
      rhs.sorttitle || rhs.title
    );
    return titleComp || (lhs.artist || "").localeCompare(rhs.artist || "");
  });
}
