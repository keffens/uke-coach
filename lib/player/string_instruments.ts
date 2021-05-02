import * as Tone from "tone";
import { DEFAULT_SAMPLE_URLS, SamplerInstrument } from "./instruments";
import { Chord, ChordLib, PitchedNote, Strum, StrumType } from "../music";

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

let percursion: StringPercurion;

/** Base class for plugged string instruments. */
export class StringInstrument extends SamplerInstrument {
  readonly strings: Array<PitchedNote>;
  constructor(
    name: string,
    strings: Array<string>,
    readonly chordLib: ChordLib,
    samples: Partial<Tone.SamplerOptions>
  ) {
    super(name, samples);
    this.strings = strings.map((string) => PitchedNote.parse(string));
    // Set lowest string as chord base.
    this.chordBase = this.strings.reduce(
      (lhs, rhs) => (lhs.compare(rhs) < 0 ? lhs : rhs),
      PitchedNote.MAX_NOTE
    );
    if (!percursion) percursion = new StringPercurion();
  }

  playChord(chord: Chord, strum: Strum, time: number, duration: number): void {
    let notes =
      this.chordLib.getPitchedNotes(chord, this.strings) ??
      chord.asPitchedNotes(this.chordBase);
    let delay = 0;
    let velocity = strum.emphasize ? 1.0 : 0.7;
    switch (strum.type) {
      case StrumType.Pause:
        return;
      case StrumType.Percursion:
        percursion.playNote(this.chordBase, time, velocity);
        return;
      case StrumType.Down:
        delay = Math.min(0.02, duration / this.strings.length);
        break;
      case StrumType.Up:
        delay = Math.max(-0.02, -duration / this.strings.length);
        break;
      case StrumType.Arpeggio:
        delay = (2 * duration) / this.strings.length;
        break;
      case StrumType.Tremolo:
        delay = duration / (2 * this.strings.length);
        this.playStrings(notes, time, delay, 0.5);
        this.playStrings(notes, time + duration / 2, -delay, 0.5);
        return;
      case StrumType.Plugged:
        notes = notes.filter((_, idx) => strum.strings?.includes(idx));
        break;
    }
    // Remove null notes.
    notes = notes.filter((note) => note);
    this.playStrings(notes, time, delay, velocity);
  }

  private playStrings(
    notes: Array<PitchedNote>,
    time: number,
    delay: number,
    velocity: number
  ) {
    // A negative delay means the bottom note is played first, so we add some
    // time for the first note.
    if (delay < 0) time -= delay * notes.length;
    for (let i = 0; i < notes.length; i++) {
      this.sampler.triggerAttack(
        notes[i].toString(),
        time + delay * i,
        velocity
      );
    }
  }
}

/** Standard ukulele. */
export class Ukulele extends StringInstrument {
  static NAME = "ukulele";

  constructor() {
    super(Ukulele.NAME, ["G4", "C4", "E4", "A4"], ChordLib.forUkulele(), {
      urls: DEFAULT_SAMPLE_URLS,
      baseUrl: "/samples/midi-js-soundfonts/acoustic_guitar_nylon/",
    });
  }
}

/** Ukulele with a low G string. */
export class UkuleleLowG extends StringInstrument {
  static NAME = "ukulele (low G-string)";
  constructor() {
    super(UkuleleLowG.NAME, ["G3", "C4", "E4", "A4"], ChordLib.forUkulele(), {
      urls: DEFAULT_SAMPLE_URLS,
      baseUrl: "/samples/midi-js-soundfonts/acoustic_guitar_nylon/",
    });
  }
}
