import { NextApiRequest, NextApiResponse } from "next";
import { getFirestore } from "firebase-admin/firestore";
import {
  authenticateUser,
  BadRequest,
  Forbidden,
  handleError,
  initFirebaseAdmin,
} from "../../lib/server";
import { Song, tokenize } from "../../lib/music";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    initFirebaseAdmin();
    const { idToken, songId, chordPro } = await JSON.parse(req.body);
    const uid = await authenticateUser(idToken);
    const songDoc = getFirestore().collection("songs").doc(songId);
    const ownerId = (await songDoc.get()).data()?.ownerId;
    if (ownerId !== uid) {
      throw new Forbidden("You don't have permission to edit this song.");
    }

    let song;
    try {
      song = Song.fromTokens(tokenize(chordPro));
    } catch (e) {
      throw new BadRequest("Failed to parse provided song data.");
    }
    const songData = song.toSongData(songId, ownerId, chordPro);
    await songDoc.update({ ...songData });
    await res.revalidate(`/s/${songData.id}`);
    res.status(200).json({ songData });
  } catch (e) {
    handleError(e, res);
  }
}
