import { fetchWithAuth } from ".";
import { assert, delUndefined, isString, toStringOrUndef } from "../util";

/** Song data as it's being saved in Firestore. */
export interface SongData {
  chordPro: string;
  deployed: boolean;
  id: string;
  ownerId: string;
  title: string;
  // Optional
  // Holds unpublished changes.
  chordProDraft?: string;
  artist?: string;
  sorttitle?: string;
}

/** Turns an object into SongData and validates all fields. */
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
    deployed: !!data.deployed,
    id: data.id,
    ownerId: data.ownerId,
    title: data.title,
    chorProDraft: toStringOrUndef(data.chordProDraft),
    artist: toStringOrUndef(data.sorttitle),
    sorttitle: toStringOrUndef(data.sorttitle),
  });
}

/** Sorts songs by sorttitle, and artist as a tiebreaker. */
export function sortSongs(songs: SongData[]): SongData[] {
  return songs.sort((lhs, rhs) => {
    const titleComp = (lhs.sorttitle || lhs.title).localeCompare(
      rhs.sorttitle || rhs.title
    );
    return titleComp || (lhs.artist || "").localeCompare(rhs.artist || "");
  });
}

/** Saves the song to firebase and, depending on flags, deploys it. */
export async function createSong(
  chordPro: string,
  deploy = false
): Promise<{
  errorMessage?: string;
  songData?: SongData;
}> {
  const { response, status, statusText } = await fetchWithAuth<{
    songData: SongData;
  }>("createSong", { chordPro, deploy });
  if (response) {
    return { songData: response.songData };
  }
  return { errorMessage: `${status} Failed to create song: ${statusText}` };
}

/** Saves the song to firebase and, depending on flags, deploys it. */
export async function updateSong(
  songId: string,
  chordPro: string,
  deploy = false
): Promise<{
  errorMessage?: string;
  songData?: SongData;
}> {
  const { response, status, statusText } = await fetchWithAuth<{
    songData: SongData;
  }>("updateSong", { songId, chordPro, deploy });
  if (response) {
    return { songData: response.songData };
  }
  return { errorMessage: `${status} Failed to update song: ${statusText}` };
}
