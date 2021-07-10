import React, { ReactNode, useState } from "react";
import { Button } from "bloomer";

interface ToggleIconProps {
  children: ReactNode;
  initialState?: boolean;
  onClick: (state: boolean) => void;
  tooltip?: string;
}

export default function ToggleIcon({
  children,
  initialState,
  onClick,
  tooltip,
}: ToggleIconProps) {
  const [state, setState] = useState(!!initialState);
  const color = state ? "has-text-primary-dark" : "has-text-grey";
  return (
    <Button
      className="p-3 is-white"
      onClick={() => {
        setState(!state);
        onClick(!state);
      }}
      aria-label={tooltip}
      data-tip={tooltip}
    >
      <span className={`icon ${color}`} style={{ fontSize: "1.8em" }}>
        {children}
      </span>
    </Button>
  );
}
