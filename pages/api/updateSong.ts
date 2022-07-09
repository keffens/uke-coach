import { NextApiRequest, NextApiResponse } from "next";
import { getFirestore } from "firebase-admin/firestore";
import {
  authenticateUser,
  BadRequest,
  Forbidden,
  handleError,
  initFirebaseAdmin,
  NotFound,
} from "../../lib/server";
import { Song, tokenize } from "../../lib/music";
import { SongData, toSongData } from "../../lib/firebase";
import { isString } from "tone";

/** Validates the song and returns the Song object. */
export function parseSong(chordPro: string): Song {
  try {
    return Song.fromTokens(tokenize(chordPro));
  } catch (e) {
    throw new BadRequest("Failed to parse provided song data");
  }
}

/**
 * Validates the song id and returns the corresponding Firebase document
 * references.
 */
export function songRef(songId: any) {
  if (!isString(songId)) {
    throw new BadRequest("`songId` is not given or invalid");
  }
  return getFirestore().collection("songs").doc(songId);
}

/** Reads the song data from Firestore and validates user permissions. */
export async function readSongData(
  songId: any,
  uid: string
): Promise<SongData> {
  const snapshot = (await songRef(songId).get()).data();
  if (!snapshot) {
    throw new NotFound(`The song with id "${songId}" does not exist`);
  }
  const songData = toSongData(snapshot);
  if (songData.ownerId !== uid) {
    throw new Forbidden("You don't have permission to edit this song");
  }
  return songData;
}

export default async function updateSong(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    initFirebaseAdmin();
    const { idToken, chordPro, deploy, songId } = await JSON.parse(req.body);
    const uid = await authenticateUser(idToken);
    const song = parseSong(chordPro);

    let songData = await readSongData(songId, uid);
    if (deploy) {
      songData = song.toSongData(
        songId,
        songData.ownerId,
        chordPro,
        /*deployed=*/ true
      );
    } else {
      songData.chordProDraft = chordPro;
    }
    await songRef(songId).update({ ...songData });

    if (deploy) {
      await res.revalidate(`/s/${songData.id}`);
    }
    res.status(200).json({ songData });
  } catch (e) {
    handleError(e, res);
  }
}
