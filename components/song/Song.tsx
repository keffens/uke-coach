import React from "react";
import { Column, Columns, Content, Title, Subtitle } from "bloomer";
import { BarLine, Chord, Pattern } from ".";

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
    const line = BarLine.parse(
      "Na[C]cí un 29 de feb[F..]rero en San [G..]Juan de Wawa[C]ni. [F..][G..]",
      pattern
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
          <line.Render />
        </div>
      </Content>
    );
  };
}
