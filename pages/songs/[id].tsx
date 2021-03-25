import fs from "fs";
import { join } from "path";
import Layout from "../../components/Layout";
import { Song } from "../../lib/music";
import { SongComponent } from "../../components/song";
import { GetStaticProps, GetStaticPaths } from "next";
import { SongMetadata, tokenize } from "../../lib/music";

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
