import { ReactNode } from "react";
import Head from "next/head";
import Navbar from "./Navbar";
import {
  Box,
  createTheme,
  responsiveFontSizes,
  ThemeProvider,
} from "@mui/material";
import { cyan, grey, pink } from "@mui/material/colors";

export function calcRootMx(factor = 1) {
  return { xs: 2 * factor, sm: 4 * factor, md: `${5 * factor}vw` };
}

const theme = responsiveFontSizes(
  createTheme({
    palette: {
      primary: { main: cyan["A700"], light: cyan["100"] },
      secondary: { main: pink["A200"] },
    },
    typography: {
      h1: { fontSize: "2.5rem", fontWeight: "700", textAlign: "center" },
      h2: { fontSize: "2rem", fontWeight: "400", textAlign: "center" },
      h3: { fontSize: "1.75rem", fontWeight: "500" },
      h4: { fontSize: "1.5rem", fontWeight: "500" },
      h5: { fontSize: "1.1rem", fontWeight: "400" },
    },
  })
);

interface LayoutProps {
  title?: string;
  children: ReactNode;
}

export default function Layout({ title, children }: LayoutProps) {
  title = title ? `Ukulele Coach - ${title}` : "Ukulele Coach";
  return (
    <>
      <Head>
        <title>{title}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ThemeProvider theme={theme}>
        <Box minHeight="100vh" pb={24} position="relative">
          <Navbar />
          <Box mx={calcRootMx()} my={{ xs: 4, md: 8 }}>
            {children}
          </Box>
          <Box
            bgcolor={grey[100]}
            bottom={0}
            position="absolute"
            textAlign="center"
            width="100%"
            pt={8}
            pb={12}
          >
            Ukulele Coach - 2022
          </Box>
        </Box>
      </ThemeProvider>
    </>
  );
}
