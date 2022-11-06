import * as Tone from "tone";
import { Bar, PitchedNote, Song } from "../music";
import { assert } from "../util";
import { InstrumentPlayer, Woodblock } from "./instruments";
import { StringInstrument } from "./string_instrument";

interface TimeBar {
  time: Tone.Unit.Time;
  // Absence of the bar triggers the Player to stop.
  bar?: Bar;
  idx?: number;
}

/** Connects to the audio interface and initializes instruments. */
class PlayerImpl {
  autoScroll = true;
  onSongFinishes: (() => void) | null = null;
  private playing = false;
  private countInBars = 1;
  private initialized = false;
  private instruments = new Array<InstrumentPlayer>();
  private metronomeInstrument: InstrumentPlayer | null = null;
  private metronomeLoop: Tone.Loop | null = null;
  private metronomeIsOn = true;
  private playback: Tone.Part | null = null;
  private playbackIsOn = true;
  private song: Song | null = null;
  private activeBarIdx = 0;

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
    Tone.Transport.bpm.value = this.song.metadata.tempo;
    console.log("Loading song", this.song.metadata.title);
    this.activeBarIdx = 0;
    if (this.initialized) {
      this.setUpSong();
      // The extra stop seems to be necessary when switching pages for some
      // reason.
      this.stop();
    }
  }

  /** Cleans up all scheduled events and loops. */
  cleanup(): void {
    // TODO: Cleanup doesn't work. Every time we navigate from one page to
    // another, something is broken.
    this.stop();
    if (!this.song) return;
    console.log("Cleaning up song", this.song.metadata.title);
    this.metronomeLoop?.dispose();
    this.playback?.clear();
    this.playback?.dispose();
    this.playback = null;
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

  /** Returns the duration of one bar in milliseconds. */
  get barDurationMs(): number {
    return Tone.Time("1m").toMilliseconds();
  }

  /** Returns the duration of one beat in milliseconds. */
  get beatDurationMs(): number {
    assert(this.song, "The song is not defined.");
    return this.barDurationMs / this.song.metadata.time.beats;
  }

  /** Whether to enable the metronome. */
  set metronomeEnabled(enable: boolean) {
    this.metronomeIsOn = enable;
    if (this.metronomeLoop) {
      this.metronomeLoop.mute = !enable;
    }
  }

  /**
   * Make playback more resource firendly. Helps with playback on Android
   * phones and maybe other browsers / systems.
   */
  set resrouceSavingEnabled(enable: boolean) {
    for (const instrument of this.instruments) {
      instrument.resourceSavingEnabled = enable;
    }
  }

  get resourceSavingEnabled(): boolean {
    return !!this.instruments[0]?.resourceSavingEnabled;
  }

  get metronomeEnabled() {
    return this.metronomeIsOn;
  }

  /** Whether to enable the playback. */
  set playbackEnabled(enable: boolean) {
    this.playbackIsOn = enable;
    if (this.playback) {
      this.playback.mute = !enable;
    }
  }

  get playbackEnabled() {
    return this.playbackIsOn;
  }

  set countIn(bars: number) {
    this.countInBars = bars;
  }

  set bpm(bpm: number) {
    Tone.Transport.bpm.value = bpm;
  }

  get bpm(): number {
    return Tone.Transport.bpm.value;
  }

  get isPlaying(): boolean {
    return this.playing;
  }

  /**
   * Starts playback. Returns the time in milliseconds, when the first part
   * starts. The pauseTime can be set to specify the point where to continue
   * the playback.
   */
  play(): void {
    if (this.playing) return;
    this.playing = true;
    console.log("starting playback at bar", this.activeBarIdx);
    let countInStart = Tone.immediate() + 0.2;
    this.playMetronome(countInStart, this.countInBars);
    Tone.Transport.start(
      countInStart + this.countInDurationSec,
      `${this.activeBarIdx}:0`
    );
  }

  /** Stops the playback. */
  stop(): void {
    this.playing = false;
    console.log("stopping playback");
    Tone.Transport.stop();
    this.song?.highlightPart(-1);
    this.activeBarIdx = 0;
  }

  /** Pauses the playback a the current bar. */
  pause(): void {
    this.playing = false;
    console.log("pausing playback");
    Tone.Transport.stop();
  }

  /** Sets the bar where to continue playing. */
  goToPrevPart(): void {
    if (this.playing) return;
    let barCount = 0;
    let partIdx = 0;
    for (const part of this.song!.parts) {
      if (barCount + part.barsLength >= this.activeBarIdx) break;
      barCount += part.barsLength;
      partIdx++;
    }

    this.activeBarIdx = barCount;
    this.song!.highlightPart(partIdx);
  }

  /** Sets the bar where to continue playing. */
  goToNextPart(): void {
    if (this.playing) return;
    let barCount = 0;
    let partIdx = 0;
    for (const part of this.song!.parts) {
      barCount += part.barsLength;
      partIdx++;
      if (barCount > this.activeBarIdx) break;
    }
    if (partIdx >= this.song!.parts.length) return;

    this.activeBarIdx = barCount;
    this.song!.highlightPart(partIdx);
  }

  private setUpSong(): void {
    for (const instrument of this.song!.instrumentLib.instruments) {
      this.instruments.push(new StringInstrument(instrument));
    }
    // TODO: Support setting the bpm per part. Setting might not even the
    //       real problem but rather resetting when loading a new song.
    Tone.Transport.timeSignature = this.song!.metadata.time.beats;
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
    assert(!this.playback, "Expected playback to be empty");
    const bars: TimeBar[] = this.song!.bars.map((bar, idx) => ({
      time: `${idx}:0`,
      bar,
      idx,
    }));
    // The last element stops the playback and resets the player.
    bars.push({ time: `${bars.length}:0` });

    let lastBar: Bar | null = null;
    this.playback = new Tone.Part((time, { bar, idx }) => {
      if (lastBar) {
        lastBar.highlight = false;
      }
      if (!bar) {
        this.stop();
        if (this.onSongFinishes) {
          this.onSongFinishes();
        }
        return;
      }

      this.activeBarIdx = idx || 0;
      lastBar = bar;
      bar.highlight = true;
      for (let i = 0; i < this.instruments.length; i++) {
        this.instruments[i].playBar(bar, time, i);
      }
    }, bars).start("0:0");
  }
}

export const Player = new PlayerImpl();
