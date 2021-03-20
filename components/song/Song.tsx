import React from "react";
import { Column, Columns, Content, Title, Subtitle } from "bloomer";
import { Bar, Chord, Pattern } from ".";

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

export class Song {
  title = "Marinero Wawani";
  artist = "Monsieur Periné";
  key? = "C";
  time = "4/4";
  tempo = 100;

  Render = () => {
    const pattern = Pattern.fromString("|DuX.uuX.|", 4);
    const bar1 = new Bar([Chord.fromString("C")], pattern, 0, [
      "Nací un 29 de feb-",
    ]);
    const bar2 = new Bar(
      [Chord.fromString("F"), Chord.fromString("G")],
      pattern,
      1,
      ["rero en San", "Juan de Wawani"]
    );
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
        <div>
          <pattern.RenderWithCount />
        </div>
        <div>
          <bar1.Render />
          <bar2.Render />
        </div>
      </Content>
    );
  };
}
