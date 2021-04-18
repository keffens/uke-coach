import * as Tone from "tone";

const PIANO_SAMPLER_OPT: Partial<Tone.SamplerOptions> = {
  urls: {
    C4: "C4.mp3",
    "D#4": "Ds4.mp3",
    "F#4": "Fs4.mp3",
    A4: "A4.mp3",
  },
  release: 1,
  baseUrl: "https://tonejs.github.io/audio/salamander/",
};

export class Player {
  private samplers = new Map<string, Tone.Sampler>();
  constructor() {
    this.samplers.set(
      "piano",
      new Tone.Sampler(PIANO_SAMPLER_OPT).toDestination()
    );
  }

  async init() {
    await Tone.loaded();
  }

  play(instrument: string, note: string, duration: Tone.Unit.Time) {
    this.samplers.get(instrument).triggerAttackRelease(note, duration);
  }
}
