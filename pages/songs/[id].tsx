import fs from "fs";
import { GetStaticProps, GetStaticPaths } from "next";
import { join } from "path";
import Layout from "../../components/Layout";
import SongComponent from "../../components/song/SongComponent";
import { Song, tokenize } from "../../lib/music";
import { assert } from "../../lib/util";

const SONGS_DIR = join(process.cwd(), "songs");

interface SongPageProps {
  songCrd: string;
}

export default function SongPage({ songCrd }: SongPageProps) {
  const song = Song.fromTokens(tokenize(songCrd));
  const artist = song.metadata.artist ? ` by ${song.metadata.artist}` : "";
  return (
    <Layout title={`Ukulele Coach - ${song.metadata.title}${artist}`}>
      <SongComponent song={song} />
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async (context) => {
  assert(context.params, "context.params not defined");
  const song = fs.readFileSync(
    join(SONGS_DIR, `${context.params.id}.crd`),
    "utf8"
  );
  return { props: { songCrd: song } };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const songs = fs
    .readdirSync(SONGS_DIR)
    .filter((file) => file.endsWith(".crd"))
    .map((file) => file.replace(/\.crd$/, ""));
  return {
    paths: songs.map((song) => ({ params: { id: song } })),
    fallback: false,
  };
};
