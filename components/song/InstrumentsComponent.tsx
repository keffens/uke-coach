import React, {
  Dispatch,
  forwardRef,
  ReactNode,
  SetStateAction,
  useState,
} from "react";
import { FaGuitar } from "react-icons/fa";
import { GiGuitar, GiGuitarBassHead, GiGuitarHead } from "react-icons/gi";
import {
  Instrument,
  InstrumentLib,
  InstrumentType,
  Note,
} from "../../lib/music";
import VisibilityToggle from "../elements/VisibilityToggle";
import VolumeToggle from "../elements/VolumeToggle";
import VolumeIcon from "../elements/VolumeIcon";
import InstrumentChordsComponent from "./InstrumentChordsComponent";
import InstrumentPatternsComponent from "./InstrumentPatternsComponent";
import { VisibilityOffOutlined } from "@mui/icons-material";
import { Box, Button, Typography, Stack, Tabs, Tab } from "@mui/material";
import OutlinedBox from "../elements/OutlinedBox";

interface InstrumentIconProps {
  instrument: Instrument;
}

function InstrumentIcon({ instrument }: InstrumentIconProps) {
  switch (instrument.type) {
    case InstrumentType.Ukulele:
    case InstrumentType.UkuleleLowG:
      return <FaGuitar />;
    case InstrumentType.Guitar:
      return <GiGuitarHead />;
    case InstrumentType.Bass:
      return <GiGuitarBassHead />;
    default:
      return <GiGuitar />;
  }
}

interface IntrumentButtonProps {
  instrument: Instrument;
  isActive: boolean;
  children?: ReactNode;
  setInstrument: Dispatch<SetStateAction<Instrument | null>>;
}

const IntrumentButton = forwardRef(
  (
    { instrument, isActive, children, setInstrument }: IntrumentButtonProps,
    ref: React.ForwardedRef<HTMLButtonElement>
  ) => {
    return (
      <Button
        color={isActive ? "primary" : "info"}
        onClick={() => setInstrument(isActive ? null : instrument)}
        ref={ref}
        size="large"
        sx={{ mx: { md: 1 }, minWidth: "max-content" }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mx: 1 }}>
          <InstrumentIcon instrument={instrument} />
          <Box pt={0.5}>{children}</Box>
          {!instrument.show && <VisibilityOffOutlined fontSize="small" />}
          <VolumeIcon vol={instrument.volume} fontSize="small" />
        </Stack>
      </Button>
    );
  }
);

interface InstrumentTabProps {
  instrument: Instrument | null;
  onChange: (propagate: boolean) => void;
  songKey?: Note;
}

function InstrumentTab({ instrument, onChange, songKey }: InstrumentTabProps) {
  if (!instrument) return <></>;
  let name = instrument.name;
  if (instrument.name !== instrument.type) {
    name += ` - ${instrument.type}`;
  }
  return (
    <OutlinedBox sx={{ mt: 0 }}>
      <Typography variant="h3" mb={2}>
        {name}{" "}
        <VisibilityToggle
          initialVisibility={instrument.show}
          onChange={(visibility) => {
            instrument.show = visibility;
            onChange(true);
          }}
        />
        <VolumeToggle
          initialVolume={instrument.volume}
          onChange={(vol) => {
            instrument.volume = vol;
            onChange(false);
          }}
        />
      </Typography>
      <InstrumentChordsComponent
        chordLib={instrument.chordLib}
        songKey={songKey}
      />
      <InstrumentPatternsComponent instrument={instrument} />
    </OutlinedBox>
  );
}

export interface InstrumentsComponentProps {
  instrumentLib: InstrumentLib;
  onVisibilityChange: () => void;
  songKey?: Note;
}

export default function InstrumentsComponent({
  instrumentLib,
  onVisibilityChange,
  songKey,
}: InstrumentsComponentProps) {
  const [activeInstrument, setInstrument] = useState<Instrument | null>(
    instrumentLib.instruments[0] ?? null
  );
  const [update, forceUpdate] = useState(0);

  return (
    <>
      <Tabs
        value={activeInstrument?.name || ""}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
      >
        {instrumentLib.instruments.map((instrument) => (
          <Tab
            component={IntrumentButton}
            key={instrument.name}
            value={instrument.name}
            label={instrument.name}
            instrument={instrument}
            isActive={activeInstrument === instrument}
            setInstrument={setInstrument}
          />
        ))}
      </Tabs>
      <InstrumentTab
        key={activeInstrument?.name}
        instrument={activeInstrument}
        onChange={(propagate: boolean) => {
          forceUpdate(update + 1);
          if (propagate) onVisibilityChange();
        }}
        songKey={songKey}
      />
    </>
  );
}
