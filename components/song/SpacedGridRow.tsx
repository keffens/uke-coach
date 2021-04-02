import React, { ReactNode } from "react";

export interface SpacedGridRowProps {
  children: ReactNode;
  className?: string;
  spacing: number[];
}

export default function SpacedGridRow({
  children,
  className,
  spacing,
}: SpacedGridRowProps) {
  const gridTemplateColumns = spacing.map((s) => `${s}fr`).join(" ");
  return (
    <div style={{ display: "grid", gridTemplateColumns }} className={className}>
      {children}
    </div>
  );
}
