import React, { useState } from "react";
import { Button } from "bloomer";
import { BiHide, BiShow } from "react-icons/bi";

interface VisibilityToggleProps {
  initialVisibility: boolean;
  onChange?: (visibility: boolean) => void;
}

export default function VisibilityToggle({
  initialVisibility,
  onChange,
}: VisibilityToggleProps) {
  const [isVisible, setVisibility] = useState(initialVisibility);
  return (
    <Button
      style={{ verticalAlign: "middle" }}
      className="is-white"
      onClick={() => {
        setVisibility(!isVisible);
        if (onChange) onChange(!isVisible);
      }}
    >
      <span className="icon has-text-primary-dark">
        {isVisible ? (
          <BiShow style={{ fontSize: "2em" }} />
        ) : (
          <BiHide style={{ fontSize: "2em" }} />
        )}
      </span>
    </Button>
  );
}
