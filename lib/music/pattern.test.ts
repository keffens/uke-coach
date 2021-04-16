import { Pattern } from "./pattern";
import { TimeSignature } from "./signature";
import { Token, TokenType } from "./token";

const TWO_TWO = new TimeSignature(2, 2);
const THREE_FOUR = new TimeSignature(3, 4);
const FOUR_FOUR = new TimeSignature(4, 4);

test("creates empty patterns and converts them to strings", () => {
  expect(Pattern.makeEmpty(TWO_TWO).toString()).toBe("|----|");
  expect(Pattern.makeEmpty(THREE_FOUR).toString()).toBe("|------|");
  expect(Pattern.makeEmpty(FOUR_FOUR).toString()).toBe("|--------|");
  expect(Pattern.makeEmpty(TWO_TWO, 0).toString()).toBe("");
  expect(Pattern.makeEmpty(TWO_TWO, 2).toString()).toBe("|----|----|");
  expect(Pattern.makeEmpty(TWO_TWO, 2, 2).toString()).toBe("|--|--|");
});

test("creates default patterns and converts them to strings", () => {
  expect(Pattern.makeDefault(TWO_TWO).toString()).toBe("|d---|");
  expect(Pattern.makeDefault(THREE_FOUR).toString()).toBe("|d-----|");
});

test("parses patterns and converts them to strings", () => {
  expect(Pattern.parse("|d-du-udu|", TWO_TWO).toString()).toBe("|d-du-udu|");
  expect(Pattern.parse("|d-du-udu|", FOUR_FOUR).toString()).toBe("|d-du-udu|");
  expect(Pattern.parse("|d-du-u|", THREE_FOUR).toString()).toBe("|d-du-u|");
  expect(Pattern.parse("|d-d-d-d-|d-d-du-u|", FOUR_FOUR).toString()).toBe(
    "|d-d-d-d-|d-d-du-u|"
  );
  expect(Pattern.parse("", FOUR_FOUR).toString()).toBe("");
  expect(Pattern.parse("|dd|", TWO_TWO).toString()).toBe("|dd|");
  expect(Pattern.parse("|dudu|", TWO_TWO).toString()).toBe("|dudu|");
  expect(Pattern.parse("|dududu|", TWO_TWO).toString()).toBe("|dududu|");
  expect(Pattern.parse("|dudududu|", TWO_TWO).toString()).toBe("|dudududu|");
  expect(Pattern.parse("dd", TWO_TWO).toString()).toBe("|dd|");
  expect(Pattern.parse("dd|uu", TWO_TWO).toString()).toBe("|dd|uu|");
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
  expect(Pattern.parse("|d-du|", FOUR_FOUR).strumsPerBar).toBe(4);
  expect(Pattern.parse("|d-du-udu|", FOUR_FOUR).strumsPerBar).toBe(8);
  expect(Pattern.parse("|d-du-udu|d-du-udu|", FOUR_FOUR).strumsPerBar).toBe(8);
  expect(Pattern.parse("|d-du-u|", THREE_FOUR).strumsPerBar).toBe(6);
  expect(Pattern.makeEmpty(TWO_TWO, 1, 6).strumsPerBar).toBe(6);
  expect(Pattern.makeEmpty(TWO_TWO, 0, 0).strumsPerBar).toBeNaN();
});

test("computes strums per beat", () => {
  expect(Pattern.parse("|d-du|", FOUR_FOUR).strumsPerBeat).toBe(1);
  expect(Pattern.parse("|d-du|", TWO_TWO).strumsPerBeat).toBe(2);
  expect(Pattern.parse("|d-du-udu|", FOUR_FOUR).strumsPerBeat).toBe(2);
  expect(Pattern.parse("|d-du-udu|d-du-udu|", FOUR_FOUR).strumsPerBeat).toBe(2);
  expect(Pattern.parse("|d-du-u|", THREE_FOUR).strumsPerBeat).toBe(2);
  expect(Pattern.makeEmpty(TWO_TWO, 1, 6).strumsPerBeat).toBe(3);
  expect(Pattern.makeEmpty(TWO_TWO, 0, 0).strumsPerBeat).toBeNaN();
});

test("determines whether to use tabs", () => {
  expect(Pattern.parse("|d-du|", TWO_TWO).useTab()).toBe(false);
  expect(Pattern.parse("|d-2u|", TWO_TWO).useTab()).toBe(true);
});

test("determines whether to display as main pattern", () => {
  expect(Pattern.parse("|du|", TWO_TWO).isMainPattern()).toBe(false);
  expect(Pattern.parse("|du|", TWO_TWO, "name").isMainPattern()).toBe(true);
  expect(Pattern.parse("|du|", TWO_TWO, "*secret").isMainPattern()).toBe(false);
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

  expect(Pattern.fromToken(readA, FOUR_FOUR, patterns)).toBe(patternA);
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
