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
    "Input cannot be converted to SongData"
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
