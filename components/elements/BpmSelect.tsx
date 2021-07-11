import React, { useState } from "react";
import { Control, Input } from "bloomer";

interface BpmSelectProps {
  initialBpm: number;
  onChange: (bpm: number) => void;
}

// TODO: When selected, offer a slider for fast bpm change
export default function BpmSelect({ initialBpm, onChange }: BpmSelectProps) {
  const [bpm, setState] = useState(`${initialBpm}`);
  return (
    <Control
      className="my-2"
      style={{ display: "inline-block", width: "4.5em" }}
      hasIcons="right"
    >
      <Input
        onChange={(event) => {
          const value = (event.target as HTMLInputElement).value.replace(
            /\D/g,
            ""
          );
          let newBpm = parseInt(value);

          if (newBpm >= 20) {
            newBpm = Math.min(newBpm, 400);
            setState(`${newBpm}`);
            onChange(newBpm);
          } else {
            setState(value);
          }
        }}
        value={bpm}
        style={{
          height: "2em",
          padding: "0.5em",
          paddingRight: "2em",
          textAlign: "right",
        }}
      />
      <span
        className="icon is-right"
        style={{ fontSize: "80%", fontWeight: "bold", marginTop: "2px" }}
      >
        bpm
      </span>
    </Control>
  );
}
