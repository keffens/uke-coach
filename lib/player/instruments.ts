import * as Tone from "tone";
import { Bar, Chord, ChordLib, PitchedNote, Strum, StrumType } from "../music";

const DEFAULT_SAMPLE_URLS = {
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

  abstract playNote(note: PitchedNote, time: number): void;
  abstract playChord(chord: Chord, strum: Strum, time: number): void;
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

  playNote(note: PitchedNote, time: number): void {
    this.sampler.triggerAttack(note.toString(), time);
  }

  playChord(chord: Chord, strum: Strum, time: number): void {
    if (strum.type === StrumType.Pause) return;
    for (const note of chord.asPitchedNotes(this.chordBase)) {
      this.playNote(note, time);
    }
  }

  playBar(bar: Bar, time: number) {
    // TODO: Actually play the bar according to the pattern.
    const chord = bar.chords[0];
    if (chord) {
      this.playChord(chord, Strum.down(), time);
    }
  }
}

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
  }

  // TODO: String instruments should overwrite playChord using the chord library.
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

/** Woodblock. */
export class Woodblock extends SamplerInstrument {
  static NAME = "woodblock";
  constructor() {
    super(Woodblock.NAME, {
      urls: DEFAULT_SAMPLE_URLS,
      baseUrl: "/samples/midi-js-soundfonts/woodblock/",
    });
  }
}
