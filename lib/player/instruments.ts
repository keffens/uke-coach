import * as Tone from "tone";
import {
  Bar,
  Chord,
  Instrument,
  Pattern,
  PitchedNote,
  Strum,
  StrumType,
  VolumeSetting,
} from "../music";

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

export type NoteInput = PitchedNote | string;

/**
 * If the input is a string, returns the string. If it's a PitchedNote,
 * converts it to string.
 */
export function noteToString(note: NoteInput): string {
  if (note instanceof PitchedNote) return note.toString();
  return note;
}

/** Base class for all instruments. */
export abstract class InstrumentPlayer {
  readonly instrument?: Instrument;
  readonly name: string;
  public resourceSavingEnabled = false;
  constructor(instrumentOrName: Instrument | string) {
    if (typeof instrumentOrName === "string") {
      this.name = instrumentOrName;
    } else {
      this.instrument = instrumentOrName;
      this.name = this.instrument?.name;
    }
  }

  abstract playNote(note: NoteInput, time: number, velocity?: number): void;
  abstract muteNote(note: NoteInput, time: number): void;
  abstract mute(time: number): void;
  abstract playChord(
    chord: Chord,
    strum: Strum,
    time: number,
    duration: number
  ): void;
  abstract playBar(bar: Bar, time: number, instrumentIdx?: number): void;
}

/** Instrument which uses the Tone.js samples to create sound. */
export class SamplerInstrument extends InstrumentPlayer {
  readonly sampler: Tone.Sampler;
  constructor(
    instrumentOrName: Instrument | string,
    samplerOptions: Partial<Tone.SamplerOptions>,
    protected chordBase = PitchedNote.C4
  ) {
    super(instrumentOrName);
    this.sampler = new Tone.Sampler(samplerOptions).toDestination();
  }

  playNote(note: NoteInput, time: number, velocity = 1.0): void {
    if (this.instrument) {
      if (this.instrument.volume == VolumeSetting.Mute) return;
      if (this.instrument.volume == VolumeSetting.Low) velocity *= 0.3;
    }
    this.sampler.triggerAttack(noteToString(note), time, velocity);
  }

  muteNote(note: NoteInput, time: number) {
    this.sampler.triggerRelease(noteToString(note), time);
  }

  mute(time: number): void {
    this.sampler.releaseAll(time);
  }

  playChord(chord: Chord, strum: Strum, time: number, duration: number): void {
    if (strum.type === StrumType.Pause) return;
    if (strum.type === StrumType.Rest || this.resourceSavingEnabled) {
      this.mute(time);
    }
    for (const note of chord.asPitchedNotes(this.chordBase)) {
      this.playNote(note, time);
    }
  }

  playBar(bar: Bar, time: number, instrumentIdx = 0): void {
    const pattern = bar.patterns[instrumentIdx];
    const barIdx = bar.patternIdxs[instrumentIdx];
    const strumDuration = Tone.Time("1m").toSeconds() / pattern.strumsPerBar;
    const strumBeats = 1 / pattern.strumsPerBeat;
    let chordIdx = 0;
    let chord = bar.previousChord;
    let beats = 0;
    for (let i = 0; i < pattern.strumsPerBar; i++) {
      if (beats + Number.EPSILON >= bar.beats[chordIdx]) {
        beats -= bar.beats[chordIdx];
        chordIdx++;
      }
      beats += strumBeats;
      // Keep previous chord if this one is not defined.
      chord = bar.chords[chordIdx] ?? chord;
      if (!chord) continue;
      const strum = pattern.getStrum(i, barIdx);
      if (strum.type === StrumType.Tremolo) {
        const noteLength =
          pattern.strumLength(i, barIdx) * pattern.strumNoteLength;
        this.playTremolo(chord, time + i * strumDuration, noteLength);
      } else {
        this.playChord(chord, strum, time + i * strumDuration, strumDuration);
      }
    }
  }

  private playTremolo(chord: Chord, time: number, noteLength: number): void {
    const sixteenth = Tone.Time("16n").toSeconds();
    const count = 16 * noteLength + Number.EPSILON;
    for (let i = 0; i < count; i++) {
      this.playChord(
        chord,
        i % 2 === 0 ? Strum.down() : Strum.up(),
        time + i * sixteenth,
        sixteenth
      );
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
