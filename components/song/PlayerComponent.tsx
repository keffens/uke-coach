import { Button } from "bloomer";
import { FaPlay, FaPause, FaStop } from "react-icons/fa";
import styles from "./Song.module.scss";

interface PlayerComponentProps {
  playing?: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
}

export default function PlayerComponentProps({
  playing,
  onPlay,
  onPause,
  onStop,
}: PlayerComponentProps) {
  return (
    <div className={styles.player}>
      {playing ? (
        <Button
          isColor="primary"
          className="is-rounded p-4 mx-1"
          onClick={onPause}
        >
          <FaPause />
        </Button>
      ) : (
        <Button
          isColor="primary"
          className="is-rounded p-4 mx-1"
          onClick={onPlay}
        >
          <FaPlay />
        </Button>
      )}
      <Button isColor="light" className="is-rounded p-4 mx-1" onClick={onStop}>
        <FaStop />
      </Button>
    </div>
  );
}
