import Link from "next/link";
import Layout from "../../components/Layout";
import {
  initFirebase,
  SongData,
  sortSongs,
  toSongData,
} from "../../lib/firebase";
import { useEffect, useState } from "react";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import { Notification } from "bloomer/lib/elements/Notification";
import { songLink } from "../../lib/router";

function SongRow({ id, title, artist }: SongData) {
  return (
    <li>
      <Link href={songLink(id)}>
        <a>
          <strong>{title}</strong>
          {artist ? ` by ${artist}` : ""}
        </a>
      </Link>
    </li>
  );
}

// TODO: Add paginagion, page-wise lookups, and search functionality once
//       there are enough songs.
// TODO: Filtering should be done in the backend to not leak undeplyed songs.
//       Owns songs should be excempt from filtering.
export default function SongPage() {
  const [songs, setSongs] = useState<SongData[]>();

  useEffect(() => {
    initFirebase();
    getDocs(collection(getFirestore(), "songs")).then((snapshot) => {
      setSongs(
        sortSongs(
          snapshot.docs
            .map((s) => toSongData(s.data()))
            .filter((s) => s.deployed)
        )
      );
    });
  }, []);

  if (!songs) {
    return (
      <Layout>
        <Notification isColor="primary">Loading...</Notification>
      </Layout>
    );
  }

  return (
    <Layout>
      <ul>
        {songs.map((song) => (
          <SongRow key={song.id} {...song} />
        ))}
      </ul>
    </Layout>
  );
}
