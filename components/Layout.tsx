import { ReactNode } from "react";
import Head from "next/head";
import styles from "./Layout.module.scss";
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
        <main className={styles.main}>
          <Container>{children}</Container>
        </main>

        <Footer className={styles.footer}>
          <Content hasTextAlign="centered">Ukulele Coach - 2021</Content>
        </Footer>
      </div>
    </>
  );
}
