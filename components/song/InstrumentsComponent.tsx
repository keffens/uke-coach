import React, { Dispatch, SetStateAction, useState } from "react";
import { Tab, Tabs, TabList, TabLink, Title } from "bloomer";
import { BiHide } from "react-icons/bi";
import { FaGuitar } from "react-icons/fa";
import { GiGuitarBassHead, GiGuitarHead } from "react-icons/gi";
import { Instrument, InstrumentLib, InstrumentType } from "../../lib/music";
import VisibilityToggle from "../elements/VisibilityToggle";
import VolumeToggle from "../elements/VolumeToggle";
import VolumeIcon from "../elements/VolumeIcon";
import InstrumentChordsComponent from "./InstrumentChordsComponent";
import InstrumentPatternsComponent from "./InstrumentPatternsComponent";

interface InstrumentIconProps {
  instrument: Instrument;
}

function InstrumentIcon({ instrument }: InstrumentIconProps) {
  switch (instrument.type) {
    case InstrumentType.Ukulele:
    case InstrumentType.UkuleleLowG:
      return <GiGuitarBassHead />;
    case InstrumentType.Guitar:
      return <GiGuitarHead />;
    default:
      return <FaGuitar />;
  }
}

interface IntrumentButtonProps {
  instrument: Instrument;
  isActive: boolean;
  setInstrument: Dispatch<SetStateAction<Instrument | null>>;
}

function IntrumentButton({
  instrument,
  isActive,
  setInstrument,
}: IntrumentButtonProps) {
  return (
    <Tab isActive={isActive}>
      <TabLink onClick={() => setInstrument(isActive ? null : instrument)}>
        <InstrumentIcon instrument={instrument} />
        <span className="ml-2">{instrument.name}</span>
        {instrument.show ? <></> : <BiHide className="ml-2" />}
        <VolumeIcon vol={instrument.volume} className="ml-2" />
      </TabLink>
    </Tab>
  );
}

interface InstrumentTabProps {
  instrument: Instrument | null;
  onChange: (propagate: boolean) => void;
}

function InstrumentTab({ instrument, onChange }: InstrumentTabProps) {
  if (!instrument) return <></>;
  let name = instrument.name;
  if (instrument.name !== instrument.type) {
    name += ` - ${instrument.type}`;
  }
  return (
    <>
      <Title tag="h3" className="mb-3">
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
      </Title>
      <InstrumentChordsComponent chordLib={instrument.chordLib} />
      <InstrumentPatternsComponent instrument={instrument} />
    </>
  );
}

export interface InstrumentsComponentProps {
  instrumentLib: InstrumentLib;
  onVisibilityChange: () => void;
}

export default function InstrumentsComponent({
  instrumentLib,
  onVisibilityChange,
}: InstrumentsComponentProps) {
  const [activeInstrument, setInstrument] = useState<Instrument | null>(
    instrumentLib.instruments[0] ?? null
  );
  const [update, forceUpdate] = useState(0);
  return (
    <>
      <Tabs isToggle>
        <TabList>
          {instrumentLib.instruments.map((instrument) => (
            <IntrumentButton
              key={instrument.name}
              instrument={instrument}
              isActive={activeInstrument === instrument}
              setInstrument={setInstrument}
            />
          ))}
        </TabList>
      </Tabs>
      <InstrumentTab
        key={activeInstrument?.name}
        instrument={activeInstrument}
        onChange={(propagate: boolean) => {
          forceUpdate(update + 1);
          if (propagate) onVisibilityChange();
        }}
      />
    </>
  );
}
