import React, { useEffect } from "react";
import { Button } from "bloomer";
import {
  FaPlay,
  FaPause,
  FaStepBackward,
  FaStepForward,
  FaStop,
} from "react-icons/fa";
import styles from "./Song.module.scss";
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

export default function PlayerComponentProps({
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
      <Button
        isSize="small"
        className="is-rounded p-2 mx-1"
        disabled={playing}
        onClick={() => {
          onGoBackward();
        }}
      >
        <FaStepBackward />
      </Button>
      {playing ? (
        <Button
          isColor="primary"
          className="is-rounded p-4 mx-1"
          onClick={() => {
            Player.stop();
            onPause();
          }}
        >
          <FaPause />
        </Button>
      ) : (
        <Button
          isColor="primary"
          className="is-rounded p-4 mx-1"
          onClick={async () => {
            await Player.init();
            const startTime = Player.play(pauseTime);
            onPlay(startTime);
          }}
        >
          <FaPlay />
        </Button>
      )}
      <Button
        isColor="light"
        className="is-rounded p-4 mx-1"
        onClick={() => {
          Player.stop();
          onStop();
        }}
      >
        <FaStop />
      </Button>
      <Button
        isSize="small"
        className="is-rounded p-2 mx-1"
        disabled={playing}
        onClick={() => {
          onGoForward();
        }}
      >
        <FaStepForward />
      </Button>
    </div>
  );
}
