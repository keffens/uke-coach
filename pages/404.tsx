import { Box } from "@mui/material";
import Layout from "../components/Layout";

export default function NotFound() {
  return (
    <Layout>
      <Box textAlign="center">
        <b>404</b> | This page could not be found.
      </Box>
    </Layout>
  );
}
