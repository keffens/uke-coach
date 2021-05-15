import { SONG_METADATA_KEYS } from "./metadata";
import { NONEMPTY_TOKENS, Token, TokenType } from "./token";

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
  ["define", "chord"],
]);

const TEXT_RE = String.raw`(?:[^\[\]\{\}\\#]|\\\[|\\\]|\\\{|\\\}|\\\\|\\#)+`;
// This allows a lot more than valid chords.
const CHORD_RE = String.raw`[\w_.,:;'"/*]*`;
const KEY_RE = String.raw`[A-Za-z_]+`;
const FIRST_TOKEN = new RegExp(
  String.raw`^(?:(${TEXT_RE})|\[(${CHORD_RE})\]|` +
    String.raw`\{(${KEY_RE})(?::\s*(${TEXT_RE}))?\}|\s*#\s*(.*))`,
  "u"
);
const SPLIT_META = new RegExp(String.raw`^(${KEY_RE})\s*(${TEXT_RE})$`, "u");
const SPLIT_PATTERN = new RegExp(
  String.raw`^(?:(${TEXT_RE})\s+)?([-.\|\dduxat\(\)]+)$`,
  "iu"
);
const SPLIT_CHORD = new RegExp(
  String.raw`^([\w*]+)\s+(?:frets\s+)?((?:(x|\d+)\s+)+(x|\d+))$`,
  "iu"
);

function tokenizeDirective(key: string, value?: string) {
  key = KEY_ALIAS.get(key) ?? key;
  value = value?.trim();
  if (key.startsWith("start_of_")) {
    return new Token(
      TokenType.StartEnv,
      key.replace(/^start_of_/, ""),
      value,
      []
    );
  }
  if (key.startsWith("end_of_")) {
    return new Token(TokenType.EndEnv, key.replace(/^end_of_/, ""));
  }
  if (key === "meta") {
    const match = value?.match(SPLIT_META);
    if (!match) {
      throw new Error(`Invalid meta directive with value "${value}".`);
    }
    key = match[1];
    value = match[2].trim();
  }
  if (SONG_METADATA_KEYS.has(key)) {
    return new Token(TokenType.Metadata, key, value?.trim());
  }
  if (key === "pattern") {
    if (!value) {
      throw new Error("Found pattern directive without pattern or name.");
    }
    const match = value.match(SPLIT_PATTERN);
    if (match) {
      return new Token(TokenType.Pattern, match[1]?.trim(), match[2]);
    }
    return new Token(TokenType.Pattern, value);
  }
  if (key === "chord") {
    const match = value?.match(SPLIT_CHORD);
    if (match) {
      return new Token(TokenType.ChordDefinition, match[1].trim(), match[2]);
    }
    throw new Error(
      `Found define chord directive with invalid chord: ${value}`
    );
  }
  return new Token(TokenType.Directive, key, value);
}

function addDirective(
  stack: Token[],
  activeTokens: Token[],
  token: Token
): Token[] {
  switch (token.type) {
    case TokenType.StartEnv:
      activeTokens.push(token);
      stack.push(token);
      activeTokens = token.children;
      break;
    case TokenType.EndEnv:
      if (stack.length <= 1) {
        throw new Error(
          `end_of_${token.key} directive does not have an opening directive.`
        );
      }
      stack.pop();
      activeTokens = stack[stack.length - 1].children;
      if (activeTokens[activeTokens.length - 1].key !== token.key) {
        throw new Error(
          `Closing environment end_of_${token.key} does not match opening ` +
            `environment start_of_${activeTokens[activeTokens.length - 1].key}.`
        );
      }
      break;
    default:
      activeTokens.push(token);
  }
  return activeTokens;
}

function parseLine(
  stack: Token[],
  activeTokens: Token[],
  line: string,
  index: number
): Token[] {
  let pos = 0;
  while (pos < line.length) {
    const match = line.slice(pos).match(FIRST_TOKEN);
    try {
      if (!match) {
        throw new Error("Failed to parse song file");
      }
      if (match[1]) {
        activeTokens.push(
          new Token(TokenType.Text, /*key=*/ undefined, match[1])
        );
      } else if (match[2]) {
        activeTokens.push(
          new Token(TokenType.Chord, /*key=*/ undefined, match[2])
        );
      } else if (match[3]) {
        const token = tokenizeDirective(match[3], match[4]);
        activeTokens = addDirective(stack, activeTokens, token);
      } else if (match[5]) {
        activeTokens.push(
          new Token(TokenType.FileComment, /*key=*/ undefined, match[5])
        );
      }
    } catch (e) {
      throw new Error(
        e.message + `; at line ${index + 1}, position ${pos + 1}`
      );
    }
    pos += match[0].length || 1;
  }
  return activeTokens;
}

export function tokenize(content: string): Token {
  const stack = new Array<Token>();
  stack.push(new Token(TokenType.StartEnv, undefined, undefined, []));
  let activeTokens = stack[0].children;
  const lines = content.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim().length) {
      if (
        activeTokens.length &&
        activeTokens[activeTokens.length - 1].type != TokenType.Paragraph
      ) {
        activeTokens.push(new Token(TokenType.Paragraph));
      }
      continue;
    }
    activeTokens = parseLine(stack, activeTokens, line, i);
    if (
      activeTokens.length &&
      NONEMPTY_TOKENS.has(activeTokens[activeTokens.length - 1].type)
    ) {
      activeTokens.push(new Token(TokenType.LineBreak));
    }
  }
  if (stack.length !== 1) {
    throw new Error("File has unclosed environments.");
  }
  return stack[0];
}

export class TokenEnvironment {
  constructor(readonly startToken: Token, readonly tokens: Token[]) {}
}
