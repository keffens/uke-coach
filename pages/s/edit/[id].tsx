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
import {
  Button,
  Content,
  Control,
  Field,
  Label,
  Notification,
  TextArea,
} from "bloomer";
import { Song, tokenize } from "../../../lib/music";
import SongMetadataComponent from "../../../components/song/SongMetadataComponent";
import { assert } from "../../../lib/util";
import Link from "next/link";
import { NEW_SONG_ID, songLink, songRawEditorLink } from "../../../lib/router";

const NEW_SONG: SongData = {
  chordPro: "",
  chordProDraft:
    "{title: <NEW SONG>}\n" +
    "{artist: <ARTIST (optional)>}\n\n" +
    "{key: C}\n" +
    "{tempo: 100}\n" +
    "{time: 4/4}\n",
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
      setSuccess(deploy ? "Song saved and deployed!" : "Draft saved!");
    } else {
      setError(`Saving failed: ${errorMessage}`);
    }
    setSaving(SavingState.NotSaving);
  };

  useEffect(() => {
    parseSong();
  }, []);
  return (
    <Content>
      {parsedSong && <SongMetadataComponent metadata={parsedSong.metadata} />}
      <Field>
        <Label>Chord Pro</Label>
        <Control>
          <TextArea
            value={songCrd}
            style={{ height: "40em", maxHeight: "none" }}
            onChange={(e) =>
              setSongCrd((e.target as HTMLTextAreaElement).value)
            }
            disabled={!!saving}
          />
        </Control>
      </Field>
      <Field isGrouped>
        <Control>
          <Button
            isColor="warning"
            onClick={() => {
              if (parseSong()) setSuccess("Validation successful!");
            }}
            disabled={!!saving}
          >
            Validate
          </Button>
        </Control>
        <Control>
          <Button
            isColor="primary"
            onClick={() => saveSong(/*deploy=*/ false)}
            isLoading={saving == SavingState.Draft}
            disabled={
              (song.chordProDraft || song.chordPro) === songCrd || !!saving
            }
          >
            Save draft
          </Button>
        </Control>
        <Control>
          <Button
            onClick={() => setSongCrd(song.chordPro)}
            disabled={!song.deployed || songCrd === song.chordPro || !!saving}
          >
            Reset to deployed
          </Button>
        </Control>
      </Field>
      <Field isGrouped>
        <Control>
          <Button
            isColor="primary"
            onClick={() => saveSong(/*deploy=*/ true)}
            isLoading={saving == SavingState.Deploy}
            disabled={song.chordPro === songCrd || !!saving}
          >
            Save & deploy
          </Button>
        </Control>
        <Control>
          <Link href={songLink(song.id)}>
            <Button
              isColor="light"
              isLink
              disabled={!song.deployed || !!saving}
            >
              Go to song
            </Button>
          </Link>
        </Control>
      </Field>
      {error && <Notification isColor="danger">{error}</Notification>}
      {success && <Notification isColor="success">{success}</Notification>}
    </Content>
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
        <Notification isColor="primary">Loading...</Notification>
      </Layout>
    );
  }
  if (error) {
    return (
      <Layout title={pageTitle}>
        <Notification isColor="danger">{error}</Notification>
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
