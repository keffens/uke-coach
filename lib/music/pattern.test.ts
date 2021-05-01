import { Pattern } from "./pattern";
import { TimeSignature } from "./signature";
import { Strum } from "./strum";
import { Token, TokenType } from "./token";

const TWO_TWO = new TimeSignature(2, 2);
const THREE_FOUR = new TimeSignature(3, 4);
const FOUR_FOUR = new TimeSignature(4, 4);

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

test("determines whether to use tabs", () => {
  expect(Pattern.parse("|d-du|", TWO_TWO).useTab()).toEqual(false);
  expect(Pattern.parse("|d-2u|", TWO_TWO).useTab()).toEqual(true);
});

test("determines whether to display as main pattern", () => {
  expect(Pattern.parse("|du|", TWO_TWO).isMainPattern()).toEqual(false);
  expect(Pattern.parse("|du|", TWO_TWO, "name").isMainPattern()).toEqual(true);
  expect(Pattern.parse("|du|", TWO_TWO, "*secret").isMainPattern()).toEqual(
    false
  );
});

test("converts between tokens and patterns", () => {
  const patterns = new Map<string, Pattern>();
  const tokenA = new Token(TokenType.Pattern, "island", "|d-du-udu|");
  const readA = new Token(TokenType.Pattern, "island");
  const patternA = Pattern.fromToken(tokenA, FOUR_FOUR, patterns);
  const tokenB = new Token(TokenType.Pattern, "dum-dagadaga", "|d---dudu|");
  const patternB = Pattern.fromToken(tokenB, FOUR_FOUR, patterns);
  const tokenC = new Token(TokenType.Pattern, undefined, "|d---|");
  const patternC = Pattern.fromToken(tokenC, FOUR_FOUR, patterns);

  expect(patternA.toToken()).toEqual(tokenA);
  expect(patternB.toToken()).toEqual(tokenB);
  expect(patternC.toToken()).toEqual(tokenC);

  expect(patterns).toEqual(
    new Map([
      ["island", patternA],
      ["dum-dagadaga", patternB],
    ])
  );

  expect(Pattern.fromToken(readA, FOUR_FOUR, patterns)).toEqual(patternA);
});

test("fails for invalid calls to token conversion", () => {
  const patterns = new Map<string, Pattern>();
  const tokenA = new Token(TokenType.Pattern, "island", "|d-du-udu|");
  const readA = new Token(TokenType.Pattern, "island");
  const tokenAA = new Token(TokenType.Pattern, "island", "|D-du-udu|");
  const readB = new Token(TokenType.Pattern, "unknown");
  Pattern.fromToken(tokenA, FOUR_FOUR, patterns);

  expect(() => Pattern.fromToken(tokenAA, FOUR_FOUR, patterns)).toThrow();
  expect(() => Pattern.fromToken(readA, TWO_TWO, patterns)).toThrow();
  expect(() => Pattern.fromToken(readB, FOUR_FOUR, patterns)).toThrow();
});
