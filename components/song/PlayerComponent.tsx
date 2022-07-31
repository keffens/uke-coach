import React, { useEffect, useState } from "react";
import { GiMetronome } from "react-icons/gi";
import BpmSelect from "../elements/BpmSelect";
import ToggleIcon from "../elements/ToggleIcon";
import { Song } from "../../lib/music";
import { Player } from "../../lib/player";
import { useWakeLock } from "react-screen-wake-lock";
import {
  ArrowDropDownCircleOutlined,
  PauseCircleFilled,
  PlayCircleFilled,
  SkipNext,
  SkipPrevious,
  Speed,
  StopCircle,
} from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { Box } from "@mui/system";
import { NAVBAR_STICKY_HEIGHT } from "../Navbar";
import { calcRootMx } from "../Layout";

interface PlayerComponentProps {
  song: Song;
}

export default function PlayerComponent({ song }: PlayerComponentProps) {
  const [playing, setPlaying] = useState(false);
  const screenLock = useWakeLock({
    onError: () => console.error("Screen Wake Lock: An error happened!"),
  });
  useEffect(() => {
    Player.loadSong(song);
    Player.onSongFinishes = () => setPlaying(false);
    return () => Player.cleanup();
  }, []);
  useEffect(() => {
    if (!screenLock.isSupported) return;
    if (playing) {
      screenLock.request();
    } else {
      screenLock.release();
    }
  }, [playing]);
  return (
    /**
     * The player spreads over the entire width of the screen and is sticky
     * below the navar. */
    <Box
      bgcolor="white"
      boxShadow={3}
      mx={calcRootMx(-1)}
      p={0.5}
      position="sticky"
      textAlign="center"
      top={NAVBAR_STICKY_HEIGHT}
      zIndex={1}
      sx={{ "> *": { m: 2, verticalAlign: "middle", whiteSpace: "nowrap" } }}
    >
      <BpmSelect
        initialBpm={song.metadata.tempo}
        onChange={(bpm) => {
          Player.bpm = bpm;
        }}
      />
      <span>
        <IconButton
          disabled={playing}
          size="large"
          onClick={() => Player.goToPrevPart()}
          sx={{ p: 0.25 }}
        >
          <SkipPrevious sx={{ fontSize: "1.75rem" }} />
        </IconButton>
        {playing ? (
          <IconButton
            color="primary"
            size="large"
            onClick={() => {
              Player.pause();
              setPlaying(false);
            }}
            sx={{ p: 0.25 }}
          >
            <PauseCircleFilled sx={{ fontSize: "2.5rem" }} />
          </IconButton>
        ) : (
          <IconButton
            color="primary"
            size="large"
            onClick={async () => {
              await Player.init();
              Player.play();
              setPlaying(true);
            }}
            sx={{ p: 0.25 }}
          >
            <PlayCircleFilled sx={{ fontSize: "2.5rem" }} />
          </IconButton>
        )}
        <IconButton
          color="default"
          size="large"
          onClick={() => {
            Player.stop();
            setPlaying(false);
          }}
          sx={{ p: 0.25 }}
        >
          <StopCircle sx={{ fontSize: "2.5rem" }} />
        </IconButton>
        <IconButton
          disabled={playing}
          size="large"
          onClick={() => Player.goToNextPart()}
          sx={{ p: 0.25 }}
        >
          <SkipNext sx={{ fontSize: "1.75rem" }} />
        </IconButton>
      </span>
      <span>
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
          <ArrowDropDownCircleOutlined fontSize="inherit" />
        </ToggleIcon>
        <ToggleIcon
          initialState={Player.resrouceSavingEnabled}
          onClick={(enable: boolean) => (Player.resrouceSavingEnabled = enable)}
          tooltip="Use less resources for playback. Sound quality may suffer."
        >
          <Speed fontSize="inherit" />
        </ToggleIcon>
      </span>
    </Box>
  );
}
