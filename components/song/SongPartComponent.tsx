import React, { Dispatch, SetStateAction, useState, useEffect } from "react";
import { Title } from "bloomer";
import BarParagraphComponent from "./BarParagraphComponent";
import { ChordLib, SongPart, TICKS_PER_BEAT } from "../../lib/music";
import { Interval, Timeout } from "../../lib/util";

class State {
  readonly playing = false;
  readonly paragraph = NaN;
  readonly tick = NaN;
  readonly tickDuration: number;
  readonly tickInterval = new Interval();
  readonly pendingTimeout = new Timeout();
  private setter?: Dispatch<SetStateAction<State>>;

  /** Creates a stopped state. */
  constructor(readonly part?: SongPart) {
    if (!part) return;
    this.tickDuration = 60000 / (TICKS_PER_BEAT * part.metadata.tempo);
  }

  /** Creates a playing state from the current state. */
  update(startTime: number): State {
    const [tick, paragraph] = this.computeTick(Date.now() - startTime);
    if (isNaN(tick)) return this.stop();
    return this.copy({ playing: true, paragraph, tick });
  }

  /** Sets the setter for this state. */
  setSetter(setter: Dispatch<SetStateAction<State>>): void {
    this.setter = setter;
  }

  /** Returns a copy of the state with the given overridden attributes. */
  private copy(override: {
    playing?: boolean;
    paragraph?: number;
    tick?: number;
  }): State {
    return Object.assign(Object.assign(new State(), this), override);
  }

  /** Stops playing and returns a new state object. */
  stop(): State {
    this.tickInterval.clear();
    this.pendingTimeout.clear();
    return this.copy({ playing: false, paragraph: NaN, tick: NaN });
  }

  /** Pauses the state at the given position. */
  pause(pauseAt: number) {
    const [tick, paragraph] = this.computeTick(pauseAt);
    this.tickInterval.clear();
    this.pendingTimeout.clear();
    return this.copy({ playing: false, paragraph, tick });
  }

  private computeTick(t: number): [number /*tick*/, number /*paragraph*/] {
    if (isNaN(t)) return [NaN, NaN];
    let tick = Math.floor(t / this.tickDuration);
    let paragraph = 0;
    while (tick >= this.part.paragraphs[paragraph].ticks) {
      tick -= this.part.paragraphs[paragraph].ticks;
      paragraph++;
      if (paragraph >= this.part.paragraphs.length) return [NaN, NaN];
    }
    return [tick, paragraph];
  }
}

export interface SongPartComponentProps {
  part: SongPart;
  chordLib?: ChordLib;
  startTime?: number;
  pauseAtTime?: number;
}

export default function SongPartComponent({
  part,
  chordLib,
  startTime,
  pauseAtTime,
}: SongPartComponentProps) {
  if (startTime && !isNaN(pauseAtTime)) {
    throw new Error("Only one of startTime and pauseAtTime may be set");
  }
  const [state, setState] = useState(new State(part));
  state.setSetter(setState);

  useEffect(() => {
    if (!isNaN(pauseAtTime)) {
      setState(state.pause(pauseAtTime));
    } else if (!startTime) {
      setState(state.stop());
    } else {
      state.pendingTimeout.set(() => {
        state.tickInterval.set(() => {
          setState(state.update(startTime));
        }, state.tickDuration);
      }, startTime - Date.now());
    }
  }, [startTime, pauseAtTime]);

  return (
    <>
      {part.header ? (
        <Title tag="h4" isMarginless className="mt-4 mb-2">
          {part.header}
        </Title>
      ) : (
        <div className="mt-5"></div>
      )}
      {part.paragraphs.map((paragraph, i) => (
        <BarParagraphComponent
          key={i}
          paragraph={paragraph}
          chordLib={chordLib}
          highlightTick={state.paragraph === i ? state.tick : NaN}
        />
      ))}
    </>
  );
}
