import { useRouter } from "next/dist/client/router";
import { useEffect, useState } from "react";
import Layout from "../../../components/Layout";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import {
  createSong,
  initFirebase,
  SongData,
  toSongData,
  updateSong,
  useFirebaseUser,
} from "../../../lib/firebase";
import { Song, tokenize } from "../../../lib/music";
import SongMetadataComponent from "../../../components/song/SongMetadataComponent";
import { assert } from "../../../lib/util";
import { NEW_SONG_ID, songLink, songRawEditorLink } from "../../../lib/router";
import { Alert, Button, Stack, TextField, Typography } from "@mui/material";
import { LoadingButton } from "@mui/lab";

const SAVED_AND_DEPLOYED_MSG =
  "Song saved and deployed! " +
  "It can take up to 1 minute until the song pate is updated.";
const NEW_SONG: SongData = {
  chordPro: "",
  chordProDraft: String.raw`{title: <NEW SONG>}
{artist: <ARTIST (optional)>}

{key: C}
{tempo: 100}
{time: 4/4}

{pattern: base pattern |duX-uuX-|}"

[C][F..][G..][C][F..][G..]
  
{start_of_verse: Verse 1}
Na[C]cí un 29 de feb[F..]rero en San [G..]Juan de Wawa[C]ni... [F..][G..]
{end_of_verse}

{start_of_chorus}
Porque en el [F]mar quiero pa[G]sar la vida en[C]tera sin record[Am]ar, que existe un ...
{end_of_chorus}
`,
  deployed: false,
  id: NEW_SONG_ID,
  ownerId: "",
  title: "<NEW SONG>",
  artist: "<ARTIST (optional)>",
};

enum SavingState {
  NotSaving = 0,
  Draft = 1,
  Deploy = 2,
}

interface SongEditorProps {
  song: SongData;
  setSong: (song: SongData) => any;
}

function SongEditor({ song, setSong }: SongEditorProps) {
  const [songCrd, setSongCrd] = useState(song.chordProDraft || song.chordPro);
  const [parsedSong, setParsedSong] = useState<Song>();
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [saving, setSaving] = useState(SavingState.NotSaving);

  const parseSong = (message?: string) => {
    setSuccess("");
    setError("");
    try {
      setParsedSong(Song.fromTokens(tokenize(songCrd)));
      return true;
    } catch (e) {
      message = message ? `${message}: ` : "";
      if (e instanceof Error) {
        setError(message + e.message);
      } else {
        setError(`${message}${e}`);
      }
    }
    return false;
  };

  const saveSong = async (deploy: boolean) => {
    if (!parseSong("Saving failed")) return;
    setSaving(deploy ? SavingState.Deploy : SavingState.Draft);
    const { songData, errorMessage } = await (song.id === NEW_SONG_ID
      ? createSong(songCrd, deploy)
      : updateSong(song.id, songCrd, deploy));
    if (songData) {
      setSong(songData);
      setSongCrd(songData.chordProDraft || songData.chordPro);
      setSuccess(deploy ? SAVED_AND_DEPLOYED_MSG : "Draft saved!");
    } else {
      setError(`Saving failed: ${errorMessage}`);
    }
    setSaving(SavingState.NotSaving);
  };

  useEffect(() => {
    parseSong();
  }, []);
  return (
    <>
      {parsedSong && <SongMetadataComponent metadata={parsedSong.metadata} />}
      <Stack mt={2} spacing={2}>
        <Typography variant="h3">Chord Pro</Typography>
        <TextField
          multiline
          value={songCrd}
          onChange={(e) => setSongCrd((e.target as HTMLTextAreaElement).value)}
          disabled={!!saving}
          fullWidth
          rows={40}
        />
        <Stack direction="row" spacing={2}>
          <Button
            color="secondary"
            variant="contained"
            onClick={() => {
              if (parseSong()) setSuccess("Validation successful!");
            }}
            disabled={!!saving}
          >
            Validate
          </Button>
          <LoadingButton
            variant="contained"
            onClick={() => saveSong(/*deploy=*/ false)}
            loading={saving == SavingState.Draft}
            disabled={
              (song.chordProDraft || song.chordPro) === songCrd || !!saving
            }
          >
            Save draft
          </LoadingButton>
          <Button
            variant="outlined"
            onClick={() => setSongCrd(song.chordPro)}
            disabled={!song.deployed || songCrd === song.chordPro || !!saving}
          >
            Reset to deployed
          </Button>
        </Stack>
        <Stack direction="row" spacing={2}>
          <LoadingButton
            variant="contained"
            onClick={() => saveSong(/*deploy=*/ true)}
            loading={saving == SavingState.Deploy}
            disabled={song.chordPro === songCrd || !!saving}
          >
            Save & deploy
          </LoadingButton>
          <Button
            variant="outlined"
            href={songLink(song.id)}
            disabled={!song.deployed || !!saving}
          >
            Go to song
          </Button>
        </Stack>
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}
      </Stack>
    </>
  );
}

export default function SongEditorPage() {
  const router = useRouter();
  const songId = router.query.id;
  const [error, setError] = useState<string>();
  const [song, setSong] = useState<SongData>();
  const [loading, setLoading] = useState(true);

  const user = useFirebaseUser(() => setLoading(false));
  const pageTitle = song ? `Edit ${song.title} ${song.artist ?? ""}` : "Editor";

  useEffect(() => {
    if (!songId) return;
    if (typeof songId !== "string") {
      setError(`Failed to load song with id ${songId}`);
      return;
    }
    initFirebase();
    if (songId === NEW_SONG_ID) {
      setSong(NEW_SONG);
      setError("");
      return;
    }
    getDoc(doc(getFirestore(), "songs", songId))
      .then((s) => {
        if (!s.data()) {
          setError(`Failed to load song with id "${songId}".`);
          return;
        }
        setSong(toSongData(s.data()));
        setError("");
      })
      .catch((e) => {
        console.log(e);
        setError(`The requested song is corrupted.`);
      });
  }, [songId]);

  useEffect(() => {
    if (!song) return;
    if (!user?.uid) {
      setError("Please log in to use the editor.");
    } else if (song.id === NEW_SONG_ID && !song.ownerId) {
      setSong({ ...song, ownerId: user.uid });
      setError("");
    } else if (user.uid != song?.ownerId) {
      setError("You don't have permission to edit this song.");
    } else {
      setError("");
    }
  }, [user, song, loading]);

  if (loading || (!song && !error)) {
    return (
      <Layout title={pageTitle}>
        <Alert severity="info">Loading...</Alert>
      </Layout>
    );
  }
  if (error) {
    return (
      <Layout title={pageTitle}>
        <Alert severity="error">{error}</Alert>
      </Layout>
    );
  }
  assert(song, "Missing song data");
  return (
    <Layout title={pageTitle}>
      <SongEditor
        song={song}
        setSong={(s) => {
          if (songId === NEW_SONG_ID) {
            router.push(songRawEditorLink(s.id), undefined, { shallow: true });
          }
          setSong(s);
        }}
      />
    </Layout>
  );
}
