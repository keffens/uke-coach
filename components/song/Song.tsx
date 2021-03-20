import { Column, Columns, Content, Title, Subtitle } from "bloomer";
import Pattern from "./Pattern";

interface NameValueColumnProps {
  name: string;
  value?: string | number;
}

function NameValueColumn({ name, value }: NameValueColumnProps) {
  if (value == null) {
    return <></>;
  }
  return (
    <Column>
      {name}: {value}
    </Column>
  );
}

export default class Song {
  title = "Marinero Wawani";
  artist = "Monsieur Periné";
  key? = "C";
  time = "4/4";
  tempo = 100;

  render() {
    const pattern = Pattern.fromString("|DuX.uuX.|DuX.uuX.|", 4);
    return (
      <Content>
        <Title tag="h1" hasTextAlign="centered">
          {this.title}
        </Title>
        <Subtitle tag="h2" hasTextAlign="centered">
          by {this.artist}
        </Subtitle>
        <Columns>
          <NameValueColumn name="key" value={this.key} />
          <NameValueColumn name="time" value={this.time} />
          <NameValueColumn name="tempo" value={this.tempo} />
        </Columns>
        {pattern.renderWithBeats()}
      </Content>
    );
  }
}
