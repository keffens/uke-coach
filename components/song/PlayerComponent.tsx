import React, { useEffect } from "react";
import {
  FaPlay,
  FaPause,
  FaStepBackward,
  FaStepForward,
  FaStop,
} from "react-icons/fa";
import { GiMetronome, GiSnail } from "react-icons/gi";
import styles from "./Song.module.scss";
import IconButton from "../elements/IconButton";
import SmallIconButton from "../elements/SmallIconButton";
import ToggleIcon from "../elements/ToggleIcon";
import { Song } from "../../lib/music";
import { Player } from "../../lib/player";

interface PlayerComponentProps {
  song: Song;
  pauseTime?: number;
  playing?: boolean;
  onPlay: (startTime: number) => void;
  onPause: () => void;
  onStop: () => void;
  onGoBackward: () => void;
  onGoForward: () => void;
}

export default function PlayerComponent({
  song,
  playing,
  pauseTime,
  onPlay,
  onPause,
  onStop,
  onGoBackward,
  onGoForward,
}: PlayerComponentProps) {
  useEffect(() => {
    Player.loadSong(song);
    return () => Player.cleanup();
  }, []);
  return (
    <div className={styles.player}>
      <SmallIconButton
        disabled={playing}
        onClick={() => {
          onGoBackward();
        }}
      >
        <FaStepBackward />
      </SmallIconButton>
      {playing ? (
        <IconButton
          isColor="primary"
          onClick={() => {
            Player.stop();
            onPause();
          }}
        >
          <FaPause />
        </IconButton>
      ) : (
        <IconButton
          isColor="primary"
          onClick={async () => {
            await Player.init();
            const startTime = Player.play(pauseTime);
            onPlay(startTime);
          }}
        >
          <FaPlay />
        </IconButton>
      )}
      <IconButton
        isColor="light"
        onClick={() => {
          Player.stop();
          onStop();
        }}
      >
        <FaStop />
      </IconButton>
      <SmallIconButton
        disabled={playing}
        onClick={() => {
          onGoForward();
        }}
      >
        <FaStepForward />
      </SmallIconButton>
      <ToggleIcon
        initialState={Player.metronomeEnabled}
        onClick={(enable: boolean) => (Player.metronomeEnabled = enable)}
      >
        <GiMetronome />
      </ToggleIcon>
      <ToggleIcon
        initialState={Player.resrouceSavingEnabled}
        onClick={(enable: boolean) => (Player.resrouceSavingEnabled = enable)}
      >
        <GiSnail />
      </ToggleIcon>
    </div>
  );
}
