import * as Tone from "tone";
import { Bar, Chord, PitchedNote, Strum, StrumType } from "../music";

export const DEFAULT_SAMPLE_URLS = {
  A0: "A0.mp3",
  A1: "A1.mp3",
  A2: "A2.mp3",
  A3: "A3.mp3",
  A4: "A4.mp3",
  A5: "A5.mp3",
  A6: "A6.mp3",
  A7: "A7.mp3",
  E1: "E1.mp3",
  E2: "E2.mp3",
  E3: "E3.mp3",
  E4: "E4.mp3",
  E5: "E5.mp3",
  E6: "E6.mp3",
  E7: "E7.mp3",
};

/** Base class for all instruments. */
export abstract class Instrument {
  constructor(readonly name: string) {}

  abstract playNote(note: PitchedNote, time: number, velocity?: number): void;
  abstract playChord(
    chord: Chord,
    strum: Strum,
    time: number,
    duration: number
  ): void;
  abstract playBar(bar: Bar, time: number): void;
}

/** Instrument which uses the Tone.js samples to create sound. */
export class SamplerInstrument extends Instrument {
  readonly sampler: Tone.Sampler;
  constructor(
    name: string,
    samplerOptions: Partial<Tone.SamplerOptions>,
    protected chordBase = PitchedNote.C4
  ) {
    super(name);
    this.sampler = new Tone.Sampler(samplerOptions).toDestination();
  }

  playNote(note: PitchedNote, time: number, velocity = 1.0): void {
    this.sampler.triggerAttack(note.toString(), time, velocity);
  }

  playChord(chord: Chord, strum: Strum, time: number, duration: number): void {
    if (strum.type === StrumType.Pause) return;
    for (const note of chord.asPitchedNotes(this.chordBase)) {
      this.playNote(note, time);
    }
  }

  playBar(bar: Bar, time: number) {
    const strumDuration =
      Tone.Time("1m").toSeconds() / bar.pattern.strumsPerBar;
    const strumBeats = 1 / bar.pattern.strumsPerBeat;
    // TODO: Actually play the bar according to the pattern.
    let chordIdx = 0;
    let chord = undefined;
    for (
      let i = 0, beats = 0;
      i < bar.pattern.strumsPerBar;
      i++, beats += strumBeats
    ) {
      if (beats + Number.EPSILON >= bar.beats[chordIdx]) {
        beats -= bar.beats[chordIdx];
        chordIdx++;
      }
      // Keep previous chord if this one is not defined.
      chord = bar.chords[chordIdx] ?? chord;
      if (!chord) continue;
      const strum = bar.pattern.getStrum(i, bar.patternIdx);
      this.playChord(chord, strum, time + i * strumDuration, strumDuration);
    }
  }
}

/** Woodblock, used as metronome. */
export class Woodblock extends SamplerInstrument {
  static NAME = "woodblock";
  constructor() {
    super(Woodblock.NAME, {
      urls: DEFAULT_SAMPLE_URLS,
      baseUrl: "/samples/midi-js-soundfonts/woodblock/",
    });
  }
}
