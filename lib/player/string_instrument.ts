import * as Tone from "tone";
import { DEFAULT_SAMPLE_URLS, SamplerInstrument } from "./instruments";
import {
  Chord,
  Instrument,
  PitchedNote,
  SoundType,
  Strum,
  StrumType,
  VolumeSetting,
} from "../music";

function makeSamplerOptions(sound: SoundType): Partial<Tone.SamplerOptions> {
  let baseUrl;
  switch (sound) {
    case SoundType.Bass:
      baseUrl = "/samples/midi-js-soundfonts/electric_bass_pick/";
      break;
    case SoundType.Electric:
      baseUrl = "/samples/midi-js-soundfonts/electric_guitar_clean/";
      break;
    case SoundType.Nylon:
      baseUrl = "/samples/midi-js-soundfonts/acoustic_guitar_nylon/";
      break;
    case SoundType.Steel:
      baseUrl = "/samples/midi-js-soundfonts/acoustic_guitar_steel/";
      break;
    default:
      throw new Error(`There are no samples for sound "${sound}"`);
  }
  return { baseUrl, urls: DEFAULT_SAMPLE_URLS };
}

/** Timpani, used as percursion strum. */
class StringPercurion extends SamplerInstrument {
  constructor() {
    super("strings percursion", {
      urls: DEFAULT_SAMPLE_URLS,
      baseUrl: "/samples/midi-js-soundfonts/timpani/",
    });
  }

  playNote(note: PitchedNote, time: number, velocity = 1.0): void {
    // Without the early release the timpani sounds too long.
    this.sampler.triggerAttackRelease(note.toString(), 0.2, time, velocity);
  }
}

function pluggedVelocity(notes: Array<PitchedNote | null>) {
  const steps = notes.filter((n) => n).length - 1;
  const decrease = 0.4 / (notes.length - 1);
  return 1.0 - steps * decrease;
}

/** Base class for plugged string instruments. */
export class StringInstrument extends SamplerInstrument {
  private static percursion: StringPercurion;
  private activeNotes: Array<string | null>;

  constructor(instrument: Instrument) {
    super(instrument, makeSamplerOptions(instrument.sound));
    // Set lowest string as chord base.
    this.chordBase = this.tuning.reduce(
      (lhs, rhs) => (lhs.compare(rhs) < 0 ? lhs : rhs),
      PitchedNote.MAX_NOTE
    );
    if (!StringInstrument.percursion) {
      StringInstrument.percursion = new StringPercurion();
    }
    this.activeNotes = Array(instrument.tuning.length).fill(null);
  }

  /** Returns the tuning of this instrument. */
  get tuning(): PitchedNote[] {
    return this.instrument!.chordLib.tuning;
  }

  mute(time: number): void {
    super.mute(time);
    this.activeNotes.fill(null);
  }

  playChord(chord: Chord, strum: Strum, time: number, duration: number): void {
    if (this.instrument!.volume === VolumeSetting.Mute) return;
    let notes =
      this.instrument!.chordLib.getPitchedNotes(chord) ??
      chord.asPitchedNotes(this.chordBase);
    let delay = 0;
    let velocity = strum.emphasize ? 0.8 : 0.6;
    switch (strum.type) {
      case StrumType.Pause:
        return;
      case StrumType.Percursion:
        this.mute(time);
        StringInstrument.percursion.playNote(
          this.chordBase,
          time,
          this.instrument!.volume === VolumeSetting.Low ? 0.2 : 0.6
        );
        return;
      case StrumType.Down:
        delay = Math.min(0.02, duration / this.tuning.length);
        break;
      case StrumType.Up:
        delay = Math.max(-0.02, -duration / this.tuning.length);
        break;
      case StrumType.Arpeggio:
        delay = (2 * duration) / this.tuning.length;
        break;
      case StrumType.Tremolo:
        delay = duration / (2 * this.tuning.length);
        this.playStrings(notes, time, delay, 0.5);
        this.playStrings(notes, time + duration / 2, -delay, 0.5);
        return;
      case StrumType.Plugged:
        notes = notes.map((note, idx) =>
          strum.strings?.includes(idx + 1) ? note : null
        );
        velocity = pluggedVelocity(notes);
        break;
      case StrumType.Tab:
        notes = strum.frets.map((fret, i) =>
          fret < 0 ? null : this.tuning[i].addSemitones(fret)
        );
        velocity = pluggedVelocity(notes);
        break;
    }
    this.playStrings(notes, time, delay, velocity);
  }

  private playStrings(
    notes: Array<PitchedNote | null>,
    time: number,
    delay: number,
    velocity: number
  ) {
    // Remove null notes.
    const playedNotes = notes.filter((note) => note).length;

    if (this.resourceSavingEnabled && playedNotes >= 3) {
      this.mute(time);
    }
    // A negative delay means the bottom note is played first, so we add some
    // time for the first note.
    if (delay < 0) time -= delay * playedNotes;
    for (let i = 0; i < notes.length; i++) {
      const note = notes[i];
      if (!note) continue;
      this.setActiveNote(i, note, time);
      this.playNote(note, time, velocity);
      time += delay;
    }
  }

  // Mute previously played notes on the same string, then set the new note.
  // Since notes are silenced by their note value, we have to remove all
  // previous uses of the note from the array. Note that tonejs mutes a note
  // before playing the same note.
  private setActiveNote(
    stringIdx: number,
    note: PitchedNote,
    time: number
  ): void {
    if (this.activeNotes[stringIdx]) {
      this.muteNote(this.activeNotes[stringIdx]!, time);
      this.activeNotes[stringIdx] = null;
    }
    for (let i = 0; i < this.activeNotes.length; i++) {
      if (this.activeNotes[i] === note.toString()) {
        this.activeNotes[i] = null;
      }
    }
    this.activeNotes[stringIdx] = note.toString();
  }
}
