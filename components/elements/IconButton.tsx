import React, { ReactNode } from "react";
import { Button } from "bloomer";

interface IconButtonProps {
  children: ReactNode;
  isColor?: string;
  onClick: () => void;
}

export default function IconButton({
  children,
  isColor,
  onClick,
}: IconButtonProps) {
  return (
    <Button isColor={isColor} className="is-rounded p-4 mx-1" onClick={onClick}>
      {children}
    </Button>
  );
}
