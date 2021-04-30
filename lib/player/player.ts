import * as Tone from "tone";
import { PitchedNote, Song } from "../music";
import { Instrument, Ukulele, UkuleleLowG, Woodblock } from "./instruments";

/** Connects to the audio interface and initializes instruments. */
export class Player {
  countInBars = 1;

  private initialized = false;
  private instruments = new Map<string, Instrument>();
  private currentPart = 0;
  private metronome = new Array<Tone.Loop>();

  constructor(private song: Song) {}

  /** Returns the count-in time in seconds. */
  get countInDurationSec(): number {
    return this.countInBars * this.song.parts[this.currentPart]?.barDurationSec;
  }

  /** Whether to enable the metronome. */
  set muteMetronome(mute: boolean) {
    for (const metronome of this.metronome) {
      metronome.mute = mute;
    }
  }

  /**
   * Initializes the player and all instruments. Must be called from a user
   * action.
   */
  async init(): Promise<void> {
    if (this.initialized) return;
    Tone.start();

    // Initialize instruments.
    this.instruments.set(Ukulele.NAME, new Ukulele());
    this.instruments.set(UkuleleLowG.NAME, new UkuleleLowG());
    this.instruments.set(Woodblock.NAME, new Woodblock());

    try {
      await Tone.loaded();
      console.log("Audio player initialized.");
    } catch {
      console.log("Failed to initialize audio player.");
    }

    // Set up metronome.
    Tone.Transport.timeSignature = this.song.metadata.time.beats;
    this.setUpMetronome();
  }

  /** Returns an instrument by name. */
  getInstrument(name: string): Instrument | null {
    return this.instruments.get(name) ?? null;
  }

  /**
   * Starts playback. Returns the time in milliseconds, when the first part
   * starts. The pauseTime can be set to specify the point where to continue
   * the playback.
   */
  play(continueAt: number = 0): number {
    let dateStart = Date.now() + 200;
    if (continueAt > 0) {
      Tone.Transport.seconds = continueAt / 1000 + this.countInDurationSec;
    } else {
      dateStart += this.countInDurationSec * 1000;
    }
    Tone.Transport.start(Tone.immediate() + 0.2);
    return dateStart;
  }

  /** Stops the playback. */
  stop(): void {
    Tone.Transport.stop();
  }

  private setUpMetronome(): void {
    // TODO: Support setting a time signature in a part.
    const woodblock = this.getInstrument(Woodblock.NAME);
    let t = 0;
    for (const part of this.song.parts) {
      Tone.Transport.bpm.setValueAtTime(part.metadata.tempo, t);
      let duration = part.durationSec;
      if (t === 0) {
        duration += this.countInDurationSec;
      }
      this.metronome.push(
        new Tone.Loop((time) => {
          const beat = Tone.Time("4n").toSeconds();
          for (let i = 0; i < part.metadata.time.beats; i++) {
            woodblock.playNote(
              i === 0 ? PitchedNote.C5 : PitchedNote.C4,
              time + i * beat
            );
          }
        }, "1m")
          .start(t)
          .stop(t + duration)
      );
      t += duration;
    }
    Tone.Transport.stop(t);
  }
}
