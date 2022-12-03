import { Bar } from "./bar";
import { Chord } from "./chord";
import { Pattern } from "./pattern";
import { TimeSignature } from "./signature";
import { Token } from "./token";

//TODO: Add tests for everything else.

function tokensToString(tokens: Token[]): string {
  return tokens.map((t) => t.toString()).join("");
}

test("tokenizes chrods and lyrics", () => {
  let bar = new Bar(
    [Chord.parse("Am")],
    [4],
    [Pattern.makeDefault(TimeSignature.DEFAULT)],
    [0],
    ["hello"],
    "ehm"
  );
  expect(tokensToString(bar.tokenizeChordsAndLyrics())).toEqual(
    "ehm [Am]hello "
  );
  expect(tokensToString(bar.tokenizeChordsAndLyrics(true))).toEqual(
    "ehm [Am]hello"
  );

  bar = new Bar(
    [Chord.parse("Am"), null, Chord.parse("D")],
    [1, 2, 1],
    [Pattern.makeDefault(TimeSignature.DEFAULT)],
    [0],
    ["1", "2 3-", "4"]
  );
  expect(tokensToString(bar.tokenizeChordsAndLyrics())).toEqual(
    "[Am.]1 [..]2 3[D.]4 "
  );
  expect(tokensToString(bar.tokenizeChordsAndLyrics(true))).toEqual(
    "[Am.]1 [..]2 3[D.]4"
  );

  bar = new Bar(
    [null],
    [3],
    [Pattern.makeDefault(new TimeSignature(3, 4))],
    [0],
    [""]
  );
  expect(tokensToString(bar.tokenizeChordsAndLyrics())).toEqual("[_]");
  expect(tokensToString(bar.tokenizeChordsAndLyrics(true))).toEqual("[_]");
});
