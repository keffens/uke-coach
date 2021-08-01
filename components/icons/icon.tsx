import ArpeggioDownIcon from "./arpeggio-down.svg";
import ArpeggioUpIcon from "./arpeggio-up.svg";
import DownStrumIcon from "./down-strum.svg";
import DownUpStrumIcon from "./down-up-strum.svg";
import PercursionIcon from "./percursion.svg";
import TremoloIcon from "./tremolo.svg";
import UpStrumIcon from "./up-strum.svg";

interface FullIconProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

function Icon({ children, className, style }: FullIconProps) {
  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}

export interface IconProps {
  className?: string;
  style?: React.CSSProperties;
}

export const ArpeggioDown = (props: IconProps) =>
  Icon({ ...props, children: <ArpeggioDownIcon fill="currentColor" /> });
export const ArpeggioUp = (props: IconProps) =>
  Icon({ ...props, children: <ArpeggioUpIcon fill="currentColor" /> });
export const DownStrum = (props: IconProps) =>
  Icon({ ...props, children: <DownStrumIcon fill="currentColor" /> });
export const DownUpStrum = (props: IconProps) =>
  Icon({ ...props, children: <DownUpStrumIcon fill="currentColor" /> });
export const Percursion = (props: IconProps) =>
  Icon({ ...props, children: <PercursionIcon fill="currentColor" /> });
export const Tremolo = (props: IconProps) =>
  Icon({ ...props, children: <TremoloIcon fill="currentColor" /> });
export const UpStrum = (props: IconProps) =>
  Icon({ ...props, children: <UpStrumIcon fill="currentColor" /> });
