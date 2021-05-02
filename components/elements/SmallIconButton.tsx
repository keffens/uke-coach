import React, { ReactNode } from "react";
import { Button } from "bloomer";

interface SmallIconButtonProps {
  children: ReactNode;
  isColor?: string;
  disabled?: boolean;
  onClick: () => void;
}

export default function SmallIconButton({
  children,
  isColor,
  disabled,
  onClick,
}: SmallIconButtonProps) {
  return (
    <Button
      isColor={isColor}
      isSize="small"
      disabled={disabled}
      className="is-rounded p-2 mx-1"
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
