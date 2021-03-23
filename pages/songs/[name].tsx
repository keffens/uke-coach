import fs from "fs";
import { join } from "path";
import Layout from "../../components/Layout";
import { Song } from "../../components/song";
import { GetStaticProps, GetStaticPaths } from "next";
import { SongMetadata, tokenize } from "../../lib/music";

const SONGS_DIR = join(process.cwd(), "songs");

interface SongPageProps {
  songCrd: string;
}

export default function SongPage({ songCrd }: SongPageProps) {
  const song = new Song();
  const tokens = tokenize(songCrd);
  const metadata = SongMetadata.fromTokens(tokens);
  console.log(metadata);
  return (
    <Layout title={`Ukulele Coach - ${song.title} by ${song.artist}`}>
      <song.render />
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async (context) => {
  const song = fs.readFileSync(
    join(SONGS_DIR, `${context.params.name}.crd`),
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
    paths: songs.map((song) => ({ params: { name: song } })),
    fallback: false,
  };
};
