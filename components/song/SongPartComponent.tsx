import React, { useState, useEffect } from "react";
import { Title } from "bloomer";
import { ChordLib, SongPart, TICKS_PER_BEAT } from "../../lib/music";
import BarParagraphComponent from "./BarParagraphComponent";

/**
 * Wrapper for a timout which allows binding of the timeout in the interval or
 * timout function.
 */
class Timeout {
  id?: NodeJS.Timeout;
}

class State {
  private constructor(
    readonly playing: boolean,
    readonly paragraph: number,
    readonly tick: number
  ) {}

  /** Creates a playing state. */
  static play(paragraph: number, tick: number): State {
    return new State(true, paragraph, tick);
  }

  /**
   * Creates a playing state. If a state is given, clears all timers on the
   * state first.
   */
  static stop(): State {
    return new State(false, NaN, NaN);
  } //

  /** Crates a state which is initialized to start playing. */
  static pending(): State {
    return new State(true, NaN, NaN);
  }
}

export interface SongPartComponentProps {
  part: SongPart;
  chordLib?: ChordLib;
  startTime?: number;
  startTick?: number;
  startParagraph?: number;
}

export default function SongPartComponent({
  part,
  chordLib,
  startTime,
  startTick,
  startParagraph,
}: SongPartComponentProps) {
  const [state, setState] = useState(State.stop());
  const tickDuration = 60000 / (TICKS_PER_BEAT * part.metadata.tempo);
  const tickInterval = new Timeout();
  const pendingTimeout = new Timeout();

  const initialize = () => {
    tickInterval.id = setInterval(() => {
      let tick =
        startTick ?? 0 + Math.floor((Date.now() - startTime) / tickDuration);
      let paragraph = startParagraph ?? 0;
      while (tick >= part.paragraphs[paragraph].ticks) {
        tick -= part.paragraphs[paragraph].ticks;
        paragraph++;
        if (paragraph >= part.paragraphs.length) {
          if (tickInterval.id) clearInterval(tickInterval.id);
          setState(State.stop());
          return;
        }
      }
      setState(State.play(paragraph, tick));
    }, tickDuration);
  };

  useEffect(() => {
    if (state.playing === !!startTime) return;
    if (!startTime) {
      if (tickInterval.id) clearInterval(tickInterval.id);
      if (pendingTimeout.id) clearTimeout(pendingTimeout.id);
      setState(State.stop());
      return;
    }
    if (startTime <= Date.now()) {
      initialize();
    } else {
      pendingTimeout.id = setTimeout(initialize, startTime - Date.now());
      setState(State.pending());
    }
  });

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
          highlightTick={state.paragraph === i ? state.tick : undefined}
        />
      ))}
    </>
  );
}
