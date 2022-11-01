import { NextApiRequest, NextApiResponse } from "next";
import { getFirestore } from "firebase-admin/firestore";
import {
  authenticateUser,
  handleError,
  initFirebaseAdmin,
} from "../../lib/server";
import { parseSong } from "./updateSong";
import { songLink } from "../../lib/router";

export default async function createSong(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    initFirebaseAdmin();
    const { idToken, chordPro, deploy } = await JSON.parse(req.body);
    const uid = await authenticateUser(idToken);
    const song = parseSong(chordPro);

    const songRef = await getFirestore().collection("songs").add({});
    const songData = song.toSongData(songRef.id, uid, chordPro, deploy);
    if (!deploy) {
      songData.chordProDraft = songData.chordPro;
      songData.chordPro = "";
    }
    await songRef.update({ ...songData });

    if (deploy) {
      console.log(`creating song ${songLink(songData.id)}`);
      res.revalidate(songLink(songData.id));
    }
    res.status(200).json({ songData });
  } catch (e) {
    handleError(e, res);
  }
}
