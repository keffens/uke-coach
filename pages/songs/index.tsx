import Link from "next/link";
import fs from "fs";
import { join } from "path";
import Layout from "../../components/Layout";
import { GetStaticProps } from "next";
import { SongMetadata, tokenize } from "../../lib/music";

const SONGS_DIR = join(process.cwd(), "songs");

interface SongRowProps {
  id: string;
  title: string;
  artist: string | null;
  sorttitle: string | null;
}

function SongRow({ id, title, artist }: SongRowProps) {
  return (
    <li>
      <Link href={`/songs/${id}`}>
        <a>
          <strong>{title}</strong>
          {artist ? ` by ${artist}` : ""}
        </a>
      </Link>
    </li>
  );
}

interface SongPageProps {
  songs: SongRowProps[];
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
  const songs = fs
    .readdirSync(SONGS_DIR)
    .filter((file) => file.endsWith(".crd"))
    .map((file): SongRowProps => {
      const metadata = SongMetadata.fromTokens(
        tokenize(fs.readFileSync(join(SONGS_DIR, file), "utf8"))
      );
      return {
        id: file.replace(/\.crd$/, ""),
        title: metadata.title,
        // Optional fields must be null or they cannot be serialized by JSON.
        artist: metadata.artist || null,
        sorttitle: metadata.sorttitle || null,
      };
    })
    .sort((lhs, rhs) => {
      const titleComp = (lhs.sorttitle || lhs.title).localeCompare(
        rhs.sorttitle || rhs.title
      );
      return titleComp || (lhs.artist || "").localeCompare(rhs.artist || "");
    });
  return { props: { songs } };
};
