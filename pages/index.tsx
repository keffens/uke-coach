import Layout from "../components/Layout";
import Song from "../components/song/Song";

export default function Home() {
  const song = new Song();
  return (
    <Layout title={`Ukulele Coach - ${song.title} by ${song.artist}`}>
      {song.render()}
    </Layout>
  );
}
