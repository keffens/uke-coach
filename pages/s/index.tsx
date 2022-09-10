import Layout from "../../components/Layout";
import { initFirebase, SongData, toSongData } from "../../lib/firebase";
import { useEffect, useState } from "react";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import SongTable from "../../components/index/SongTable";

// TODO: Add search functionality once there are enough songs.
// TODO: Filtering should be done in the backend to not leak undeplyed songs.
export default function SongPage() {
  const [songs, setSongs] = useState<SongData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initFirebase();
    getDocs(collection(getFirestore(), "songs")).then((snapshot) => {
      setSongs(
        snapshot.docs.map((s) => toSongData(s.data())).filter((s) => s.deployed)
      );
      setLoading(false);
    });
  }, []);

  return (
    <Layout>
      <SongTable songs={songs} loading={loading} />
    </Layout>
  );
}
