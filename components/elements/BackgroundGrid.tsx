import React from "react";
import styles from "./BackgroundGrid.module.scss";
import { range } from "../../lib/util";

interface BackgroundGridProps {
  cols: number;
  rows: number;
  style?: React.CSSProperties;
}

export default function BackgroundGrid({
  cols,
  rows,
  style,
}: BackgroundGridProps) {
  style = {
    gridTemplateColumns: "1fr ".repeat(cols),
    ...style,
  };
  const className = rows === 0 ? styles.line : styles.grid;
  return (
    <div className={className} style={style}>
      {range((rows || 1) * cols).map((i) => (
        <div key={i} />
      ))}
    </div>
  );
}
