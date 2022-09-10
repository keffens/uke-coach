import { Box } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Link from "next/link";
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
    <Box height="600px" width="100%">
      <DataGrid
        rows={rows}
        columns={columns}
        rowHeight={40}
        headerHeight={40}
        hideFooter
        loading={loading}
        initialState={{
          sorting: {
            sortModel: [{ field: "sorttitle", sort: "asc" }],
          },
        }}
      />
    </Box>
  );
}
