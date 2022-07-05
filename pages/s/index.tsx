import Link from "next/link";
import { getFirestore } from "firebase-admin/firestore";
import Layout from "../../components/Layout";
import { GetStaticProps } from "next";
import { initFirebaseAdmin } from "../../lib/server";
import { SongData, toSongData } from "../../lib/firebase";

function SongRow({ id, title, artist }: SongData) {
  return (
    <li>
      <Link href={`/s/${id}`}>
        <a>
          <strong>{title}</strong>
          {artist ? ` by ${artist}` : ""}
        </a>
      </Link>
    </li>
  );
}

interface SongPageProps {
  songs: SongData[];
}

export default function SongPage({ songs }: SongPageProps) {
  return (
    <Layout title={`Ukulele Coach`}>
      <ul>
        {songs.map((song) => (
          <SongRow key={song.id} {...song} />
        ))}
      </ul>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  initFirebaseAdmin();
  const query = await getFirestore().collection("songs").get();
  const songs = query.docs.map((s) => toSongData(s.data()));
  songs.sort((lhs, rhs) => {
    const titleComp = (lhs.sorttitle || lhs.title).localeCompare(
      rhs.sorttitle || rhs.title
    );
    return titleComp || (lhs.artist || "").localeCompare(rhs.artist || "");
  });
  return { props: { songs } };
};
