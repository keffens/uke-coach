import React, { ReactNode, useState } from "react";
import { Button, Icon } from "bloomer";

interface ToggleIconProps {
  children: ReactNode;
  initialState?: boolean;
  onClick: (state: boolean) => void;
}

export default function ToggleIcon({
  children,
  initialState,
  onClick,
}: ToggleIconProps) {
  const [state, setState] = useState(!!initialState);
  const color = state ? "has-text-primary-dark" : "has-text-grey";
  return (
    <Button
      style={{ border: "none" }}
      className="m-1"
      onClick={() => {
        setState(!state);
        onClick(!state);
      }}
    >
      <span className={`icon ${color}`} style={{ fontSize: "1.8em" }}>
        {children}
      </span>
    </Button>
  );
}
