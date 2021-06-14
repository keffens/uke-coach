import * as Tone from "tone";
import { PitchedNote, Song } from "../music";
import { assert } from "../util";
import { InstrumentPlayer, Woodblock } from "./instruments";
import { StringInstrument } from "./string_instrument";

/** Connects to the audio interface and initializes instruments. */
class PlayerImpl {
  private playing = false;
  private countInBars = 1;
  private initialized = false;
  private instruments = new Array<InstrumentPlayer>();
  private metronomeInstrument: InstrumentPlayer | null = null;
  private metronomeLoop: Tone.Loop | null = null;
  private metronomeIsOn = true;
  private playback = new Array<Tone.Part>();
  private playbackIsOn = true;
  private song: Song | null = null;

  /** Initializes the player. Must be called from a user action. */
  async init(): Promise<void> {
    if (this.initialized) return;
    try {
      // tone.js must be started from a user action.
      await Tone.start();

      // Initialize metronome instrument.
      this.metronomeInstrument = new Woodblock();

      await Tone.loaded();
      console.log("Audio player initialized.");

      this.setUpSong();
      this.initialized = true;
    } catch {
      console.log("Failed to initialize audio player.");
    }
  }

  /** Loads the specified song and discardsthe previous song. */
  async loadSong(song: Song): Promise<void> {
    if (this.song === song) return;
    this.cleanup();
    this.song = song;
    console.log("Loading song", this.song.metadata.title);
    if (this.initialized) {
      this.setUpSong();
      // The extra seems to be necessary when switching pages for some reason.
      this.stop();
    }
  }

  /** Cleans up all scheduled events and loops. */
  cleanup(): void {
    this.stop();
    if (!this.song) return;
    console.log("Cleaning up song", this.song.metadata.title);
    this.metronomeLoop?.dispose();
    for (const pb of this.playback) {
      pb.dispose();
    }
    this.playback = [];
    this.song = null;
  }

  /** Returns the count-in time in seconds. */
  get countInDurationSec(): number {
    return Tone.Time(`${this.countInBars}m`).toSeconds();
  }

  /** Returns the count-in time in milliseconds. */
  get countInDurationMs(): number {
    return this.countInDurationSec * 1000;
  }

  /** Whether to enable the metronome. */
  set metronomeEnabled(enable: boolean) {
    this.metronomeIsOn = enable;
    if (this.metronomeLoop) {
      this.metronomeLoop.mute = !enable;
    }
  }

  get metronomeEnabled() {
    return this.metronomeIsOn;
  }

  /** Whether to enable the playback. */
  set playbackEnabled(enable: boolean) {
    this.playbackIsOn = enable;
    for (const pb of this.playback) {
      pb.mute = !enable;
    }
  }

  get playbackEnabled() {
    return this.playbackIsOn;
  }

  set countIn(bars: number) {
    this.countInBars = bars;
  }

  /**
   * Starts playback. Returns the time in milliseconds, when the first part
   * starts. The pauseTime can be set to specify the point where to continue
   * the playback.
   */
  play(continueAtMs: number = 0): number {
    if (this.playing) return NaN;
    this.playing = true;
    console.log("starting playback");
    let countInStart = Tone.immediate() + 0.2;
    let dateStart = Date.now() + 200 + this.countInDurationMs;
    if (continueAtMs > 0) {
      Tone.Transport.seconds = continueAtMs / 1000;
    }
    this.playMetronome(countInStart, this.countInBars);
    Tone.Transport.start(countInStart + this.countInDurationSec);
    return dateStart;
  }

  /** Stops the playback. */
  stop(): void {
    this.playing = false;
    console.log("stopping playback");
    Tone.Transport.stop();
  }

  private setUpSong(): void {
    for (const instrument of this.song!.instrumentLib.instruments) {
      this.instruments.push(new StringInstrument(instrument));
    }
    // TODO: Support setting the bpm per part. Setting might not even the
    //       real problem but rather resetting when loading a new song.
    Tone.Transport.timeSignature = this.song!.metadata.time.beats;
    Tone.Transport.bpm.value = this.song!.metadata.tempo;
    this.setUpMetronome();
    this.setUpPlayback();
  }

  private setUpMetronome(): void {
    let end = this.song!.barsLength;
    this.metronomeLoop = new Tone.Loop((time) => {
      this.playMetronome(time);
    }, "1m")
      .start(`0:0`)
      .stop(`${end}:0`);
    this.metronomeLoop.mute = !this.metronomeEnabled;
    Tone.Transport.stop(`${end}:0`);
  }

  private playMetronome(time: number, bars = 1): void {
    const beatSec = Tone.Time("4n").toSeconds();
    for (let i = 0; i < bars * this.song!.metadata.time.beats; i++) {
      const isFirst = i % this.song!.metadata.time.beats === 0;
      this.metronomeInstrument!.playNote(
        isFirst ? PitchedNote.C5 : PitchedNote.C4,
        time + i * beatSec,
        isFirst ? 0.8 : 0.2
      );
    }
  }

  private setUpPlayback(): void {
    assert(this.playback.length === 0, "Expected playback to be empty");
    for (let idx = 0; idx < this.instruments.length; idx++) {
      this.playback.push(
        new Tone.Part(
          (time, value) => this.instruments[idx].playBar(value.bar, time, idx),
          this.song!.bars.map((bar, i) => ({ time: `${i}:0`, bar }))
        ).start("0:0")
      );
    }
  }
}

export const Player = new PlayerImpl();
