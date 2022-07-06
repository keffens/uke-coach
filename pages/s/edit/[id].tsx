import { useRouter } from "next/dist/client/router";
import { useEffect, useState } from "react";
import Layout from "../../../components/Layout";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import {
  callSaveSong,
  initFirebase,
  SongData,
  toSongData,
  useFirebaseUser,
} from "../../../lib/firebase";
import { Button, Control, Field, Label, Notification, TextArea } from "bloomer";
import { Song, tokenize } from "../../../lib/music";
import SongMetadataComponent from "../../../components/song/SongMetadataComponent";
import { assert } from "../../../lib/util";
import Link from "next/link";
import { songLink } from "../../../lib/router";

interface SongEditorProps {
  song: SongData;
  setSong: (song: SongData) => any;
}

function SongEditor({ song, setSong }: SongEditorProps) {
  const [songCrd, setSongCrd] = useState(song.chordPro);
  const [parsedSong, setParsedSong] = useState<Song>();
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [isSaving, setIsSaving] = useState(false);

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

  const saveSong = async () => {
    if (!parseSong("Saving failed")) return;
    setIsSaving(true);
    const { songData, errorMessage } = await callSaveSong(song.id, songCrd);
    if (songData) {
      setSong(songData);
      setSongCrd(songData.chordPro);
      setSuccess("Song saved and deployed! ");
    } else {
      setError(`Saving failed: ${errorMessage}`);
    }
    setIsSaving(false);
  };

  useEffect(() => {
    parseSong();
  }, []);
  return (
    <>
      {parsedSong && <SongMetadataComponent metadata={parsedSong.metadata} />}
      <Field>
        <Label>Chord Pro</Label>
        <Control>
          <TextArea
            value={songCrd}
            style={{ height: "800px" }}
            onChange={(e) =>
              setSongCrd((e.target as HTMLTextAreaElement).value)
            }
          />
        </Control>
      </Field>
      {error && <Notification isColor="danger">{error}</Notification>}
      {success && <Notification isColor="success">{success}</Notification>}
      <Field isGrouped>
        <Control>
          <Button
            isColor="warning"
            onClick={() => {
              if (parseSong()) setSuccess("Validation successful!");
            }}
            disabled={song.chordPro === songCrd}
          >
            Validate
          </Button>
        </Control>
        <Control>
          <Button
            isColor="primary"
            onClick={saveSong}
            isLoading={isSaving}
            disabled={song.chordPro === songCrd}
          >
            Save & deploy
          </Button>
        </Control>
        <Control>
          <Link href={songLink(song.id)}>
            <Button isColor="light" isLink>
              Go to song
            </Button>
          </Link>
        </Control>
      </Field>
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
      <SongEditor song={song} setSong={setSong} />
    </Layout>
  );
}
