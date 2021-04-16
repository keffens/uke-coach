import React, { useState } from "react";
import { Column, Columns, Content, Title } from "bloomer";
import PatternWithCountComponent from "./PatternWithCountComponent";
import PlayerComponent from "./PlayerComponent";
import SongMetadataComponent from "./SongMetadataComponent";
import SongPartComponent from "./SongPartComponent";
import { Song } from "../../lib/music";

class State {
  private startTime: number;
  readonly startTimes: Array<number>;
  readonly endTime = NaN;

  constructor(song: Song, startTime?: number) {
    this.startTime = startTime ?? NaN;
    if (!this.startTime) {
      this.startTimes = new Array(song.parts.length).fill(NaN);
      this.endTime = NaN;
      return;
    }
    this.startTimes = [];
    let t = this.startTime;
    for (let part of song.parts) {
      this.startTimes.push(t);
      t += part.duration;
    }
    this.endTime = t;
  }

  get playing(): boolean {
    return !!this.startTime && this.endTime > Date.now();
  }
}

export interface SongComponentProps {
  song: Song;
}

export default function SongComponent({ song }: SongComponentProps) {
  const [state, setState] = useState(new State(song));
  return (
    <Content>
      <SongMetadataComponent metadata={song.metadata} />
      <Title tag="h3">Strumming patterns</Title>
      <Columns isMultiline isMobile>
        {[...song.patterns.values()]
          .filter((pattern) => pattern.isMainPattern())
          .map((pattern, i) => (
            <Column key={i} style={{ minWidth: "max-content" }}>
              <PatternWithCountComponent key={i} pattern={pattern} />
            </Column>
          ))}
      </Columns>
      <Title tag="h3">Song</Title>
      <PlayerComponent
        onPlay={() => {
          if (!state.playing) {
            console.log("starting to play");
            setState(new State(song, Date.now() + 200));
          }
        }}
      />
      {song.parts.map((part, i) => (
        <SongPartComponent
          key={i}
          part={part}
          chordLib={song.chordLib}
          startTime={state.startTimes[i]}
        />
      ))}
    </Content>
  );
}
