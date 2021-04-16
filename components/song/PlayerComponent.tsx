import { Button } from "bloomer";

interface PlayerComponentProps {
  onPlay: () => void;
}

export default function PlayerComponentProps({ onPlay }: PlayerComponentProps) {
  return <Button onClick={onPlay}>play</Button>;
}
