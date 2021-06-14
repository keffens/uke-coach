import * as Tone from "tone";
import { DEFAULT_SAMPLE_URLS, SamplerInstrument } from "./instruments";
import {
  Chord,
  Instrument,
  PitchedNote,
  SoundType,
  Strum,
  StrumType,
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
  return 1.2 - notes.filter((n) => n).length * 0.2;
}

/** Base class for plugged string instruments. */
export class StringInstrument extends SamplerInstrument {
  private static percursion: StringPercurion;
  constructor(readonly instrument: Instrument) {
    super(instrument.name, makeSamplerOptions(instrument.sound));
    console.log("creating instrument player", instrument);
    // Set lowest string as chord base.
    this.chordBase = this.tuning.reduce(
      (lhs, rhs) => (lhs.compare(rhs) < 0 ? lhs : rhs),
      PitchedNote.MAX_NOTE
    );
    if (!StringInstrument.percursion) {
      StringInstrument.percursion = new StringPercurion();
    }
  }

  /** Returns the tuning of this instrument. */
  get tuning(): PitchedNote[] {
    return this.instrument.chordLib.tuning;
  }

  playChord(chord: Chord, strum: Strum, time: number, duration: number): void {
    let notes =
      this.instrument.chordLib.getPitchedNotes(chord) ??
      chord.asPitchedNotes(this.chordBase);
    let delay = 0;
    let velocity = strum.emphasize ? 0.8 : 0.6;
    switch (strum.type) {
      case StrumType.Pause:
        return;
      case StrumType.Percursion:
        StringInstrument.percursion.playNote(this.chordBase, time, velocity);
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
        notes = notes.filter((_, idx) => strum.strings?.includes(idx + 1));
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
    notes = notes.filter((note) => note);
    // A negative delay means the bottom note is played first, so we add some
    // time for the first note.
    if (delay < 0) time -= delay * notes.length;
    for (let i = 0; i < notes.length; i++) {
      this.sampler.triggerAttack(
        notes[i]!.toString(),
        time + delay * i,
        velocity
      );
    }
  }
}
