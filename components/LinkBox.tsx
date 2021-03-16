import { ReactNode } from "react";
import styles from "./LinkBox.module.scss";
import { Box, Column, Content } from "bloomer";

interface LinkBoxProps {
  href: string;
  children: ReactNode;
}

export default function LinkBox({ href, children }: LinkBoxProps) {
  return (
    <Column>
      <a href={href} target="_blank" className={styles.card}>
        <Box className={styles.linkBox}>
          <Content>{children}</Content>
        </Box>
      </a>
    </Column>
  );
}
