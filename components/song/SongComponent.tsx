import React, { Dispatch, SetStateAction, useState } from "react";
import { Column, Columns, Content, Title } from "bloomer";
import PatternWithCountComponent from "./PatternWithCountComponent";
import PlayerComponent from "./PlayerComponent";
import SongMetadataComponent from "./SongMetadataComponent";
import SongPartComponent from "./SongPartComponent";
import { Song } from "../../lib/music";
import { Timeout } from "../../lib/util";

class State {
  readonly start = NaN;
  readonly pauseAt = NaN;
  readonly duration: number;
  readonly timeOffsets = new Array<number>();
  readonly stopTimeout = new Timeout();
  private setter?: Dispatch<SetStateAction<State>>;

  /** Creates a stopped state. */
  constructor(readonly song?: Song) {
    if (!song) return;
    let t = 0;
    for (let part of song.parts) {
      this.timeOffsets.push(t);
      t += part.duration;
    }
    this.duration = t;
  }

  /** Sets the setter for this state. */
  setSetter(setter: Dispatch<SetStateAction<State>>): void {
    this.setter = setter;
  }

  /** Returns a copy of the state with the given overridden attributes. */
  private copy(override: { start: number; pauseAt: number }): State {
    return Object.assign(Object.assign(new State(), this), override);
  }

  /** Returns a new stop state. */
  stop(): State {
    this.stopTimeout.clear();
    return this.copy({ start: NaN, pauseAt: NaN });
  }

  /** Returns a state with the current time as start time. */
  play(): State {
    if (this.playing) return this;
    const start = Date.now() - (this.pauseAt || 0);
    this.stopTimeout.set(() => {
      this.setter(this.stop());
    }, this.duration - (this.pauseAt || 0));
    return this.copy({ start, pauseAt: NaN });
  }

  /** Returns a state with the current time as start time. */
  pause(): State {
    this.stopTimeout.clear();
    if (this.paused) return this.play();
    if (!this.playing) return this;
    const pauseAt = Date.now() - this.start;
    return this.copy({ start: NaN, pauseAt });
  }

  /** Returns whether the song is playing */
  get playing(): boolean {
    return !!this.start;
  }

  /** Returns whether the song is paused. */
  get paused(): boolean {
    return !!this.pauseAt;
  }

  /** Returns the start time for the given part if playing. */
  getStart(i: number): number {
    return this.start + this.timeOffsets[i] ?? NaN;
  }

  /** Returns the paused time for the given part if paused. */
  getPauseAt(i: number): number {
    return this.pauseAt - this.timeOffsets[i] ?? NaN;
  }
}

export interface SongComponentProps {
  song: Song;
}

export default function SongComponent({ song }: SongComponentProps) {
  const [state, setState] = useState(new State(song));
  state.setSetter(setState);
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
        playing={state.playing}
        onPlay={() => setState(state.play())}
        onPause={() => setState(state.pause())}
        onStop={() => setState(state.stop())}
      />
      {song.parts.map((part, i) => (
        <SongPartComponent
          key={i}
          part={part}
          chordLib={song.chordLib}
          startTime={state.getStart(i)}
          pauseAtTime={state.getPauseAt(i)}
        />
      ))}
    </Content>
  );
}
