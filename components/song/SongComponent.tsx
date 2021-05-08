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
  readonly duration = NaN;
  readonly timeOffsets = new Array<number>();
  readonly startTimeout = new Timeout();
  readonly stopTimeout = new Timeout();
  private setter: Dispatch<SetStateAction<State>> | null = null;

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

  /** Stops the playback. */
  stop(): void {
    this.startTimeout.clear();
    this.stopTimeout.clear();
    this.setter!(this.copy({ start: NaN, pauseAt: NaN }));
  }

  /** Sets the new state when the playback starts. */
  play(start: number): void {
    if (this.playing) return;
    this.startTimeout.set(() => {
      this.stopTimeout.set(
        () => this.stop(),
        this.duration - (this.pauseAt || 0)
      );
      start -= this.pauseAt || 0;
      this.setter!(this.copy({ start, pauseAt: NaN }));
    }, start - Date.now());
    // Set a new state to trigger an update.
    this.setter!(this.copy({ start: NaN, pauseAt: this.pauseAt }));
  }

  /** Pauses playback. */
  pause(): void {
    if (!this.playing) return;
    this.startTimeout.clear();
    this.stopTimeout.clear();
    let pauseAt = Date.now() - this.start;
    if (pauseAt <= 0) {
      this.stop();
      return;
    }
    // Adjust time to the beginning of the current bar.
    let t = pauseAt;
    for (let part of this.song!.parts) {
      if (t < part.duration) {
        pauseAt -= t % part.barDuration;
        break;
      }
      t -= part.duration;
    }
    this.setter!(this.copy({ start: NaN, pauseAt }));
  }

  /** If paused or stopped goes to the previous song part. */
  goBackward(): void {
    if (this.playing) return;
    let t = 0;
    for (const part of this.song!.parts) {
      if (t + part.duration >= this.pauseAt) {
        this.setter!(this.copy({ start: NaN, pauseAt: t || NaN }));
        return;
      }
      t += part.duration;
    }
  }

  /** If paused or stopped goes to the previous song part. */
  goForward(): void {
    if (this.playing) return;
    let t = 0;
    for (let i = 0; i < this.song!.parts.length - 1; i++) {
      t += this.song!.parts[i].duration;
      if (t > (this.pauseAt || 0)) {
        this.setter!(this.copy({ start: NaN, pauseAt: t }));
        return;
      }
    }
  }

  /** Returns whether the song is playing */
  get playing(): boolean {
    return !!this.start || this.startTimeout.active;
  }

  /** Returns whether the song is paused. */
  get paused(): boolean {
    return !isNaN(this.pauseAt);
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
        song={song}
        playing={state.playing}
        pauseTime={state.pauseAt}
        onPlay={(startTime) => state.play(startTime)}
        onPause={() => state.pause()}
        onStop={() => state.stop()}
        onGoBackward={() => state.goBackward()}
        onGoForward={() => state.goForward()}
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
