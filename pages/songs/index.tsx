import Link from "next/link";
import fs from "fs";
import { join } from "path";
import Layout from "../../components/Layout";
import { GetStaticProps, GetStaticPaths } from "next";

const SONGS_DIR = join(process.cwd(), "songs");

interface SongPageProps {
  songCrds: string[];
}

export default function SongPage({ songCrds }: SongPageProps) {
  return (
    <Layout title={`Ukulele Coach`}>
      <ul>
        {songCrds.map((song) => (
          <li key={song}>
            <Link href={`/songs/${song}`}>{song}</Link>
          </li>
        ))}
      </ul>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async (context) => {
  const songs = fs
    .readdirSync(SONGS_DIR)
    .filter((file) => file.endsWith(".crd"))
    .map((file) => file.replace(/\.crd$/, ""))
    .sort();
  return { props: { songCrds: songs } };
};
