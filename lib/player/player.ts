import * as Tone from "tone";
import { PitchedNote, Song } from "../music";
import { Instrument, Woodblock } from "./instruments";
import { Ukulele, UkuleleLowG } from "./string_instruments";

/** Connects to the audio interface and initializes instruments. */
class PlayerImpl {
  private playing = false;
  private countInBars = 1;
  private initialized = false;
  private instruments = new Map<string, Instrument>();
  private metronomeInstrument: Instrument;
  private metronomeLoop?: Tone.Loop;
  private events = new Array<number>();
  private song?: Song;

  constructor() {}

  /** Initializes the player. Must be called from a user action. */
  async init(): Promise<void> {
    if (this.initialized) return;
    try {
      // tone.js must be started from a user action.
      await Tone.start();

      // Initialize instruments.
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
    if (this.initialized) this.setUpSong();
  }

  /** Cleans up all scheduled events and loops. */
  cleanup(): void {
    this.stop();
    if (!this.song) return;
    console.log("Cleaning up song", this.song.metadata.title);
    this.metronomeLoop?.dispose();
    for (const id of this.events) {
      Tone.Transport.clear(id);
    }
    this.events = [];
    this.song = undefined;
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
  set muteMetronome(mute: boolean) {
    this.metronomeLoop.mute = mute;
  }

  set countIn(bars: number) {
    this.countInBars = bars;
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
  play(continueAtMs: number = 0): number {
    if (this.playing) return;
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
    if (this.playing) {
      this.playing = false;
      console.log("stopping playback");
      Tone.Transport.stop();
    }
  }

  private setUpSong(): void {
    this.instruments.set(Ukulele.NAME, new Ukulele(this.song.chordLib));
    // TODO: Support setting a time signature or at least bpm per part.
    Tone.Transport.timeSignature = this.song.metadata.time.beats;
    Tone.Transport.bpm.value = this.song.metadata.tempo;
    this.setUpMetronome();
    this.setUpPlayback();
  }

  private setUpMetronome(): void {
    let end = this.song.bars;
    this.metronomeLoop = new Tone.Loop((time) => {
      this.playMetronome(time);
    }, "1m")
      .start(`0:0:0`)
      .stop(`${end}:0:0`);
    Tone.Transport.stop(`${end}:0:0`);
  }

  private playMetronome(time: number, bars = 1): void {
    const beatSec = Tone.Time("4n").toSeconds();
    for (let i = 0; i < bars * this.song.metadata.time.beats; i++) {
      const isFirst = i % this.song.metadata.time.beats === 0;
      this.metronomeInstrument.playNote(
        isFirst ? PitchedNote.C5 : PitchedNote.C4,
        time + i * beatSec,
        isFirst ? 0.8 : 0.2
      );
    }
  }

  private setUpPlayback(): void {
    const ukulele = this.getInstrument(Ukulele.NAME);
    let t = 0;
    for (const part of this.song.parts) {
      for (const paragraph of part.paragraphs) {
        for (let i = 0; i < paragraph.bars.length; i++) {
          const bar = paragraph.bars[i];
          this.events.push(
            Tone.Transport.schedule((time) => {
              ukulele.playBar(bar, time);
            }, `${t + i}:0:0`)
          );
        }
        t += paragraph.bars.length;
      }
    }
  }
}

export const Player = new PlayerImpl();
