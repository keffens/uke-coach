import { Link } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { SongData, sortSongs } from "../../lib/firebase";
import { songLink } from "../../lib/router";

const columns: GridColDef[] = [
  {
    field: "sorttitle",
    headerName: "Song",
    minWidth: 100,
    flex: 1,
    renderCell: ({ row }) => (
      <b>
        <Link href={songLink(row.id)}>{row.title}</Link>
      </b>
    ),
  },
  {
    field: "artist",
    headerName: "Artist",
    minWidth: 100,
    flex: 1,
  },
];

export interface SongTableProps {
  songs: SongData[];
  loading?: boolean;
}

export default function SongTable({ songs, loading }: SongTableProps) {
  // Pre-sort the songs to have proper tie-breaking set up.
  const rows = sortSongs(
    songs.map((song) => ({
      ...song,
      sorttitle: song.sorttitle || song.title,
    }))
  );

  return (
    <DataGrid
      autoHeight
      columns={columns}
      disableSelectionOnClick
      loading={loading}
      pageSize={25}
      rows={rows}
      rowHeight={40}
      initialState={{
        sorting: {
          sortModel: [{ field: "sorttitle", sort: "asc" }],
        },
      }}
    />
  );
}
