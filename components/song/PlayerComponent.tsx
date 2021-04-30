import React, { useEffect } from "react";
import { Button } from "bloomer";
import { FaPlay, FaPause, FaStop } from "react-icons/fa";
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
}

export default function PlayerComponentProps({
  song,
  playing,
  pauseTime,
  onPlay,
  onPause,
  onStop,
}: PlayerComponentProps) {
  const player = new Player(song);
  return (
    <div className={styles.player}>
      {playing ? (
        <Button
          isColor="primary"
          className="is-rounded p-4 mx-1"
          onClick={() => {
            player.stop();
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
            await player.init();
            const startTime = player.play(pauseTime);
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
          player.stop();
          onStop();
        }}
      >
        <FaStop />
      </Button>
    </div>
  );
}
