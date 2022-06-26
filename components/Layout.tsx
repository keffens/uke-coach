import { ReactNode } from "react";
import Head from "next/head";
import styles from "./Layout.module.scss";
import Navbar from "./Navbar";
import { Container, Content, Footer } from "bloomer";

interface LayoutProps {
  title: string;
  children: ReactNode;
}

export default function Layout({ title, children }: LayoutProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.content}>
        <Navbar />

        <main className={styles.main}>
          <Container isFluid>{children}</Container>
        </main>

        <Footer className={styles.footer}>
          <Content hasTextAlign="centered">Ukulele Coach - 2022</Content>
        </Footer>
      </div>
    </>
  );
}
