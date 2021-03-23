import { SONG_METADATA_KEYS, Token, TokenType } from ".";

const KEY_ALIAS = new Map([
  ["t", "title"],
  ["st", "subtitle"],
  ["c", "comment"],
  ["ci", "comment_italic"],
  ["cb", "comment_box"],
  ["soc", "start_of_chorus"],
  ["eoc", "end_of_chorus"],
  ["sov", "start_of_verse"],
  ["eov", "end_of_verse"],
  ["sob", "start_of_bridge"],
  ["eob", "end_of_bridge"],
  ["sot", "start_of_tab"],
  ["eot", "end_of_tab"],
  ["sog", "start_of_grid"],
  ["eog", "end_of_grid"],
]);

const TEXT_RE = String.raw`(?:[^\[\]\{\}\\#]|\\\[|\\\]|\\\{|\\\}|\\\\|\\#)+`;
// This allows a lot more than valid chords.
const CHORD_RE = String.raw`[\w.,/*]*`;
const KEY_RE = String.raw`[A-Za-z_]+`;
const FIRST_TOKEN = new RegExp(
  String.raw`^(?:(${TEXT_RE})|\[(${CHORD_RE})\]|` +
    String.raw`\{(${KEY_RE})(?::\s*(${TEXT_RE}))?\}|\s*#\s*(.*))`,
  "u"
);
const SPLIT_META = new RegExp(String.raw`^(${KEY_RE})\s*(${TEXT_RE})$`, "u");

function tokenizeDirective(key: string, value?: string) {
  key = KEY_ALIAS.get(key) ?? key;
  if (key.startsWith("start_of_")) {
    return new Token(TokenType.StartEnv, key.replace(/^start_of_/, ""), value);
  }
  if (key.startsWith("end_of_")) {
    return new Token(TokenType.EndEnv, key.replace(/^end_of_/, ""));
  }
  if (key === "meta") {
    const match = value.match(SPLIT_META);
    if (match) {
      key = match[1];
      value = match[2];
    }
  }
  if (SONG_METADATA_KEYS.has(key)) {
    return new Token(TokenType.Metadata, value, key);
  }
  return new Token(TokenType.Directive, value, key);
}

export function tokenize(content: string): Array<Token> {
  const tokens = new Array<Token>();
  const lines = content.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim().length) {
      if (
        tokens.length &&
        tokens[tokens.length - 1].type != TokenType.Paragraph
      ) {
        tokens.push(new Token(TokenType.Paragraph));
      }
      continue;
    }
    let pos = 0;
    while (pos < line.length) {
      const match = line.slice(pos).match(FIRST_TOKEN);
      if (!match) {
        throw new Error(
          `Failed to parse song file at line ${i + 1}, ` +
            `position ${pos + 1}:\n${line}`
        );
      }
      pos += match[0].length || 1;
      if (match[1]) {
        tokens.push(new Token(TokenType.Text, match[1]));
      } else if (match[2]) {
        tokens.push(new Token(TokenType.Chord, match[2]));
      } else if (match[3]) {
        tokens.push(tokenizeDirective(match[3], match[4]));
      } else if (match[5]) {
        tokens.push(new Token(TokenType.FileComment, match[5]));
      }
    }
    tokens.push(new Token(TokenType.LineBreak));
  }

  return tokens;
}
