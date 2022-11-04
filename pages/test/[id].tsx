import { GetStaticProps, GetStaticPaths } from "next";
import { getFirestore } from "firebase-admin/firestore";
import Layout from "../../components/Layout";
import { Song, tokenize } from "../../lib/music";
import { initFirebaseAdmin } from "../../lib/server";
import { assert } from "../../lib/util";
import { SongData, toSongData } from "../../lib/firebase";

export default function SongPage({ chordPro }: SongData) {
  const song = Song.fromTokens(tokenize(chordPro));
  const title = song.metadata.artist
    ? `${song.metadata.title} by ${song.metadata.artist}`
    : song.metadata.title;
  return <Layout title={title}>{song.metadata.title}</Layout>;
}

export const getStaticProps: GetStaticProps = async (context) => {
  console.log(Date(), "getStaticProps");
  assert(typeof context.params?.id === "string", "context.params.id not valid");
  initFirebaseAdmin();
  console.log(Date(), "firebase initialized");
  const data = (
    await getFirestore().collection("songs").doc(context.params.id).get()
  ).data();
  console.log(Date(), "got data");
  if (!data) return { notFound: true };
  return { props: toSongData(data) };
};

export const getStaticPaths: GetStaticPaths = async () => {
  console.log(Date(), "getStaticPaths");
  initFirebaseAdmin();
  const songs = await getFirestore()
    .collection("songs")
    .where("deployed", "==", true)
    .get();
  return {
    paths: songs.docs.map((song) => ({ params: { id: song.id } })),
    fallback: "blocking", // Allow generation on demand for new pages.
  };
};
