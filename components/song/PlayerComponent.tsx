import React, { useEffect, useState } from "react";
import ReactTooltip from "react-tooltip";
import {
  FaPlay,
  FaPause,
  FaStepBackward,
  FaStepForward,
  FaStop,
} from "react-icons/fa";
import { GiMetronome, GiSnail } from "react-icons/gi";
import { BiCaretDownSquare } from "react-icons/bi";
import styles from "./Song.module.scss";
import BpmSelect from "../elements/BpmSelect";
import IconButton from "../elements/IconButton";
import SmallIconButton from "../elements/SmallIconButton";
import ToggleIcon from "../elements/ToggleIcon";
import { Song } from "../../lib/music";
import { Player } from "../../lib/player";

interface PlayerComponentProps {
  song: Song;
}

export default function PlayerComponent({ song }: PlayerComponentProps) {
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    Player.loadSong(song);
    Player.onSongFinishes = () => setPlaying(false);
    return () => Player.cleanup();
  }, []);
  return (
    <div className={styles.player}>
      <BpmSelect
        initialBpm={song.metadata.tempo}
        onChange={(bpm) => {
          Player.bpm = bpm;
        }}
      />
      <span className="m-2" style={{ whiteSpace: "nowrap" }}>
        <SmallIconButton
          disabled={playing}
          onClick={() => Player.goToPrevPart()}
        >
          <FaStepBackward />
        </SmallIconButton>
        {playing ? (
          <IconButton
            isColor="primary"
            onClick={() => {
              Player.pause();
              setPlaying(false);
            }}
          >
            <FaPause />
          </IconButton>
        ) : (
          <IconButton
            isColor="primary"
            onClick={async () => {
              await Player.init();
              Player.play();
              setPlaying(true);
            }}
          >
            <FaPlay />
          </IconButton>
        )}
        <IconButton
          isColor="light"
          onClick={() => {
            Player.stop();
            setPlaying(false);
          }}
        >
          <FaStop />
        </IconButton>
        <SmallIconButton
          disabled={playing}
          onClick={() => Player.goToNextPart()}
        >
          <FaStepForward />
        </SmallIconButton>
      </span>
      <span style={{ whiteSpace: "nowrap" }}>
        <ToggleIcon
          initialState={Player.metronomeEnabled}
          onClick={(enable: boolean) => (Player.metronomeEnabled = enable)}
          tooltip="Enable metronome."
        >
          <GiMetronome />
        </ToggleIcon>
        <ToggleIcon
          initialState={Player.autoScroll}
          onClick={(enable: boolean) => (Player.autoScroll = enable)}
          tooltip="Auto-scroll while palying."
        >
          <BiCaretDownSquare />
        </ToggleIcon>
        <ToggleIcon
          initialState={Player.resrouceSavingEnabled}
          onClick={(enable: boolean) => (Player.resrouceSavingEnabled = enable)}
          tooltip="Use less resources for playback. Sound quality may suffer."
        >
          <GiSnail />
        </ToggleIcon>
        <ReactTooltip className={styles.tooltip} />
      </span>
    </div>
  );
}
