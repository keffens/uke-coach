import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import { Song, tokenize } from "../../lib/music";
import { initFirebase, toSongData } from "../../lib/firebase";
import { useEffect, useState } from "react";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { Alert, Box, CircularProgress } from "@mui/material";
import SongComponent from "../../components/song/SongComponent";
import { assert } from "../../lib/util";

export default function SongPage() {
  const router = useRouter();
  const songId = router.query.id;
  const [error, setError] = useState<string>();
  const [song, setSong] = useState<Song>();

  useEffect(() => {
    if (!songId || typeof songId !== "string") return;
    initFirebase();
    getDoc(doc(getFirestore(), "songs", songId))
      .then((s) => {
        assert(s.data(), "s.data() does not exist");
        const songData = toSongData(s.data());
        // TODO: An undeployed song should not be retrievable.
        assert(songData.deployed, "The song is not deployed");
        setSong(Song.fromTokens(tokenize(songData.chordPro)));
        setError("");
      })
      .catch((e) => {
        console.log(e);
        setError(`The song with id "${songId}" was not found.`);
      });
  }, [songId]);

  if (error) {
    return (
      <Layout>
        <Alert severity="error">{error}</Alert>
      </Layout>
    );
  }
  if (!song) {
    return (
      <Layout>
        <Box textAlign="center">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }
  const title = song.metadata.artist
    ? `${song.metadata.title} by ${song.metadata.artist}`
    : song.metadata.title;
  return (
    <Layout title={title}>
      <SongComponent song={song} />
    </Layout>
  );
}
