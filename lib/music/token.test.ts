import { Token, TokenType } from "./token";

test("converts tokens to strings", () => {
  expect(new Token(TokenType.Text, "key", "value").toString()).toEqual("value");
  expect(new Token(TokenType.Chord, "key", "C7").toString()).toEqual("[C7]");
  expect(
    new Token(TokenType.ChordDefinition, "Cadd9", "0 2 0 3").toString()
  ).toEqual("{chord: Cadd9 0 2 0 3}\n");
  expect(new Token(TokenType.Metadata, "artist", "Esteman").toString()).toEqual(
    "{artist: Esteman}\n"
  );
  expect(
    new Token(TokenType.Pattern, "island", "|d-ud-udu|").toString()
  ).toEqual("{pattern: island |d-ud-udu|}");
  expect(
    new Token(TokenType.Instrument, "key", "lead ukulele").toString()
  ).toEqual("{instrument: lead ukulele}\n");
  expect(new Token(TokenType.Directive, "key", "value").toString()).toEqual(
    "{key: value}"
  );
  expect(new Token(TokenType.TabLine, "key", "|1-2-|").toString()).toEqual(
    "|1-2-|\n"
  );
  expect(new Token(TokenType.FileComment, "key", "value").toString()).toEqual(
    "# value\n"
  );
  expect(new Token(TokenType.LineBreak, "key", "value").toString()).toEqual(
    "\n"
  );
  expect(new Token(TokenType.Paragraph, "key", "value").toString()).toEqual(
    "\n"
  );
});

test("converts song to string", () => {
  expect(
    new Token(TokenType.StartEnv, "song", undefined, [
      new Token(TokenType.Metadata, "title", "Caotica Belleza"),
    ]).toString()
  ).toEqual("{title: Caotica Belleza}\n");
});
test("converts verse environment to string", () => {
  expect(
    new Token(TokenType.StartEnv, "verse", "Verse 1", [
      new Token(TokenType.Chord, undefined, "C"),
      new Token(TokenType.Text, undefined, "la la la"),
    ]).toString()
  ).toEqual(
    "{start_of_verse: Verse 1}\n" + "[C]la la la\n" + "{end_of_verse}\n"
  );
});

test("converts tab environment to string", () => {
  expect(
    new Token(TokenType.TabEnv, "tab", undefined, [
      new Token(TokenType.TabLine, undefined, "|1-2-|"),
      new Token(TokenType.TabLine, undefined, "|-3-4|"),
    ]).toString()
  ).toEqual("{start_of_tab}\n" + "|1-2-|\n" + "|-3-4|\n" + "{end_of_tab}\n");
});

test("converts instrument environment to string", () => {
  expect(
    new Token(TokenType.InstrumentEnv, "instrument", "uke", [
      new Token(TokenType.ChordDefinition, "Cadd9", "0 2 0 3"),
    ]).toString()
  ).toEqual(
    "{start_of_instrument: uke}\n" +
      "{chord: Cadd9 0 2 0 3}\n" +
      "{end_of_instrument}\n"
  );
});

test("makes error message", () => {
  const token = new Token(TokenType.Directive, "key", "value", [], 10, 2);
  expect(token.errorMsg("hi")).toEqual(
    'Line 10, pos 2, token "{key: value}": hi'
  );
  expect(token.error("hi")).toEqual(
    new Error('Line 10, pos 2, token "{key: value}": hi')
  );
});
