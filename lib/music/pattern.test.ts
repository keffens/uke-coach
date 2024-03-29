import {
  getPatternInstrumentAnnotation,
  getPatternString,
  Pattern,
} from "./pattern";
import { TimeSignature } from "./signature";
import { Strum } from "./strum";
import { Token, TokenType } from "./token";

const TWO_TWO = new TimeSignature(2, 2);
const THREE_FOUR = new TimeSignature(3, 4);
const FOUR_FOUR = new TimeSignature(4, 4);

test("splits pattern and instrument annotation", () => {
  let token = new Token(TokenType.Pattern, "name");
  expect(getPatternString(token)).toBe(null);
  expect(getPatternInstrumentAnnotation(token)).toBe(null);

  token = new Token(TokenType.Pattern, undefined, "|----|");
  expect(getPatternString(token)).toBe("|----|");
  expect(getPatternInstrumentAnnotation(token)).toBe(null);

  token = new Token(TokenType.Pattern, undefined, "|----| @ ukulele");
  expect(getPatternString(token)).toBe("|----|");
  expect(getPatternInstrumentAnnotation(token)).toBe("ukulele");

  token = new Token(TokenType.Pattern, "name", "@ ukulele");
  expect(getPatternString(token)).toBe(null);
  expect(getPatternInstrumentAnnotation(token)).toBe("ukulele");
});

test("creates empty patterns and converts them to strings", () => {
  expect(Pattern.makeEmpty(TWO_TWO).toString()).toEqual("|----|");
  expect(Pattern.makeEmpty(THREE_FOUR).toString()).toEqual("|------|");
  expect(Pattern.makeEmpty(FOUR_FOUR).toString()).toEqual("|--------|");
  expect(Pattern.makeEmpty(TWO_TWO, 0).toString()).toEqual("");
  expect(Pattern.makeEmpty(TWO_TWO, 2).toString()).toEqual("|----|----|");
  expect(Pattern.makeEmpty(TWO_TWO, 2, 2).toString()).toEqual("|--|--|");
});

test("creates default patterns and converts them to strings", () => {
  expect(Pattern.makeDefault(TWO_TWO).toString()).toEqual("|d---|");
  expect(Pattern.makeDefault(THREE_FOUR).toString()).toEqual("|d-----|");
});

test("parses patterns and converts them to strings", () => {
  expect(Pattern.parse("|d-du-udu|", TWO_TWO).toString()).toEqual("|d-du-udu|");
  expect(Pattern.parse("|d-du-udu|", FOUR_FOUR).toString()).toEqual(
    "|d-du-udu|"
  );
  expect(Pattern.parse("|d-du-u|", THREE_FOUR).toString()).toEqual("|d-du-u|");
  expect(Pattern.parse("|d-d-d-d-|d-d-du-u|", FOUR_FOUR).toString()).toEqual(
    "|d-d-d-d-|d-d-du-u|"
  );
  expect(Pattern.parse("", FOUR_FOUR).toString()).toEqual("");
  expect(Pattern.parse("|dd|", TWO_TWO).toString()).toEqual("|dd|");
  expect(Pattern.parse("|dudu|", TWO_TWO).toString()).toEqual("|dudu|");
  expect(Pattern.parse("|dududu|", TWO_TWO).toString()).toEqual("|dududu|");
  expect(Pattern.parse("|dudududu|", TWO_TWO).toString()).toEqual("|dudududu|");
  expect(Pattern.parse("dd", TWO_TWO).toString()).toEqual("|dd|");
  expect(Pattern.parse("dd|uu", TWO_TWO).toString()).toEqual("|dd|uu|");
});

test("fails to parses invalid patterns", () => {
  expect(() => Pattern.parse("|d|", TWO_TWO)).toThrow();
  expect(() => Pattern.parse("|du|", FOUR_FOUR)).toThrow();
  expect(() => Pattern.parse("|dud|", TWO_TWO)).toThrow();
  expect(() => Pattern.parse("|du|dudu|", TWO_TWO)).toThrow();
  expect(() => Pattern.parse("du|dudu", TWO_TWO)).toThrow();
  expect(() => Pattern.parse("|1234123412|", TWO_TWO)).toThrow();
});

test("computes strums per bar", () => {
  expect(Pattern.parse("|d-du|", FOUR_FOUR).strumsPerBar).toEqual(4);
  expect(Pattern.parse("|d-du-udu|", FOUR_FOUR).strumsPerBar).toEqual(8);
  expect(Pattern.parse("|d-du-udu|d-du-udu|", FOUR_FOUR).strumsPerBar).toEqual(
    8
  );
  expect(Pattern.parse("|d-du-u|", THREE_FOUR).strumsPerBar).toEqual(6);
  expect(Pattern.makeEmpty(TWO_TWO, 1, 6).strumsPerBar).toEqual(6);
  expect(Pattern.makeEmpty(TWO_TWO, 0, 0).strumsPerBar).toBeNaN();
});

test("computes strums per beat", () => {
  expect(Pattern.parse("|d-du|", FOUR_FOUR).strumsPerBeat).toEqual(1);
  expect(Pattern.parse("|d-du|", TWO_TWO).strumsPerBeat).toEqual(2);
  expect(Pattern.parse("|d-du-udu|", FOUR_FOUR).strumsPerBeat).toEqual(2);
  expect(Pattern.parse("|d-du-udu|d-du-udu|", FOUR_FOUR).strumsPerBeat).toEqual(
    2
  );
  expect(Pattern.parse("|d-du-u|", THREE_FOUR).strumsPerBeat).toEqual(2);
  expect(Pattern.makeEmpty(TWO_TWO, 1, 6).strumsPerBeat).toEqual(3);
  expect(Pattern.makeEmpty(TWO_TWO, 0, 0).strumsPerBeat).toBeNaN();
});

test("computes strum note length", () => {
  expect(Pattern.parse("|dd|", TWO_TWO).strumNoteLength).toEqual(1 / 2);
  expect(Pattern.parse("|d-du|", TWO_TWO).strumNoteLength).toEqual(1 / 4);
  expect(Pattern.parse("|d-dudu|", TWO_TWO).strumNoteLength).toBeCloseTo(1 / 6);
  expect(Pattern.parse("|d-du|", FOUR_FOUR).strumNoteLength).toEqual(1 / 4);
  expect(Pattern.parse("|d-du-udu|", FOUR_FOUR).strumNoteLength).toEqual(1 / 8);
  expect(Pattern.parse("|d-du-u|", THREE_FOUR).strumNoteLength).toEqual(1 / 8);
});

test("gets strums", () => {
  const pattern = Pattern.parse("|1234|dudu|", FOUR_FOUR);
  expect(pattern.getStrum(0)).toEqual(Strum.plugged([1]));
  expect(pattern.getStrum(2)).toEqual(Strum.plugged([3]));
  expect(pattern.getStrum(4)).toEqual(Strum.down());
  expect(pattern.getStrum(6)).toEqual(Strum.down());
  expect(pattern.getStrum(8)).toEqual(Strum.plugged([1]));
  expect(pattern.getStrum(10)).toEqual(Strum.plugged([3]));
  expect(pattern.getStrum(-1)).toEqual(Strum.up());

  expect(pattern.getStrum(1, 0)).toEqual(Strum.plugged([2]));
  expect(pattern.getStrum(1, 1)).toEqual(Strum.up());
  expect(pattern.getStrum(1, 2)).toEqual(Strum.plugged([2]));
  expect(pattern.getStrum(1, 3)).toEqual(Strum.up());
  expect(pattern.getStrum(1, -1)).toEqual(Strum.up());
});

test("gets strum length", () => {
  const pattern = Pattern.parse("|d-u-|-d--|", FOUR_FOUR);
  expect(pattern.strumLength(0)).toEqual(2);
  expect(pattern.strumLength(1)).toEqual(0);
  expect(pattern.strumLength(2)).toEqual(2);
  expect(pattern.strumLength(3)).toEqual(0);
  expect(pattern.strumLength(0, 1)).toEqual(0);
  expect(pattern.strumLength(1, 1)).toEqual(3);
  expect(pattern.strumLength(2, 1)).toEqual(0);
  expect(pattern.strumLength(3, 1)).toEqual(0);
});

test("determines whether to use tabs", () => {
  expect(Pattern.parse("|d-du|", TWO_TWO).useTab()).toEqual(false);
  expect(Pattern.parse("|d-2u|", TWO_TWO).useTab()).toEqual(true);
  const tab = Pattern.parseTab(["|0-3-|", "|-2-4|"], TWO_TWO);
  expect(tab.useTab()).toEqual(true);

  expect(
    Pattern.parse("|d-du|", TWO_TWO).useTab(/*ignorePlugged=*/ true)
  ).toEqual(false);
  expect(
    Pattern.parse("|d-2u|", TWO_TWO).useTab(/*ignorePlugged=*/ true)
  ).toEqual(false);
  expect(tab.useTab(/*ignorePlugged=*/ true)).toEqual(true);
});

test("determines whether to display as main pattern", () => {
  expect(Pattern.parse("|du|", TWO_TWO).isMainPattern()).toEqual(false);
  expect(Pattern.parse("|du|", TWO_TWO, "name").isMainPattern()).toEqual(true);
  expect(Pattern.parse("|du|", TWO_TWO, "*secret").isMainPattern()).toEqual(
    false
  );
});

test("converts between tokens and patterns", () => {
  const tokenA = new Token(TokenType.Pattern, "island", "|d-du-udu|");
  const patternA = Pattern.fromToken(tokenA, FOUR_FOUR);
  const tokenB = new Token(TokenType.Pattern, "dum-dagadaga", "|d---dudu|");
  const patternB = Pattern.fromToken(tokenB, FOUR_FOUR);
  const tokenC = new Token(TokenType.Pattern, undefined, "|d---|");
  const patternC = Pattern.fromToken(tokenC, FOUR_FOUR);
  const tokenD = new Token(TokenType.Pattern, "island", "|d-du-udu| @ ukulele");
  const patternD = Pattern.fromToken(tokenD, FOUR_FOUR);

  expect(patternA.tokenize()).toEqual(tokenA);
  expect(patternB.tokenize()).toEqual(tokenB);
  expect(patternC.tokenize()).toEqual(tokenC);

  expect(patternA.tokenize(/*onlyNameIfGiven=*/ true)).toEqual(
    new Token(TokenType.Pattern, "island")
  );
  expect(patternC.tokenize(/*onlyNameIfGiven=*/ true)).toEqual(tokenC);

  expect(patternD.tokenize()).toEqual(tokenA);
  expect(patternD.tokenize(/*onlyNameIfGiven=*/ false, "ukulele")).toEqual(
    tokenD
  );
  expect(patternD.tokenize(/*onlyNameIfGiven=*/ true, "ukulele")).toEqual(
    new Token(TokenType.Pattern, "island", "@ ukulele")
  );
});

test("prases tab", () => {
  const tab = Pattern.parseTab(["|0-3-|--24|", " ---- | 4--(11)"], TWO_TWO);
  expect(tab.strums[0]).toEqual(Strum.tab([0, -1]));
  expect(tab.strums[7]).toEqual(Strum.tab([4, 11]));
  expect(tab.toString(0)).toEqual("|0-3-|--24|");
  expect(tab.toString(1)).toEqual("|----|4--(11)|");
  expect(tab.strumsPerBar).toEqual(4);
  expect(tab.strumsPerBeat).toEqual(2);
  expect(tab.useTab()).toEqual(true);
});

test("prases tab from token", () => {
  const tab = Pattern.fromToken(
    new Token(TokenType.TabEnv, "tab", undefined, [
      new Token(TokenType.TabLine, undefined, "|1-2-|"),
      new Token(TokenType.TabLine, undefined, "|-3-4|"),
    ]),
    FOUR_FOUR
  );
  // Internally, we start with the lowest string.
  expect(tab.toString(0)).toEqual("|-3-4|");
  expect(tab.toString(1)).toEqual("|1-2-|");
  expect(tab.strumsPerBar).toEqual(4);
  expect(tab.strumsPerBeat).toEqual(1);
  expect(tab.useTab()).toEqual(true);
});

test("prases tab from token and converts back to tab", () => {
  const token = new Token(TokenType.TabEnv, "tab", "name", [
    new Token(TokenType.TabLine, undefined, "|8-(10)-   |4-(12)-|"),
    new Token(TokenType.TabLine, undefined, "|-9-   (11)|---   -|"),
  ]);
  const tab = Pattern.fromToken(token, FOUR_FOUR);
  expect(tab.tokenize()).toEqual(token);
});
