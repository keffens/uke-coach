import { ReactNode } from "react";
import Head from "next/head";
import styles from "./Layout.module.scss";
import { Content, Footer } from "bloomer";

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
        <main className={styles.main}>{children}</main>

        <Footer className={styles.footer}>
          <Content hasTextAlign="centered">
            <a
              href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              Powered by{" "}
              <img
                src="/vercel.svg"
                alt="Vercel Logo"
                className={styles.logo}
              />
            </a>
          </Content>
        </Footer>
      </div>
    </>
  );
}
