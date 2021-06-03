import { assert } from "../util";
import { SONG_METADATA_KEYS } from "./metadata";
import { ADD_LINEBREAK_AFTER, Token, TokenType } from "./token";

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
const TAB_LINE = /^(?:[-.\|\d ]|\(\d+\))+$/i;
const SPLIT_CHORD = /^([\w*]+)\s+(?:frets\s+)?((?:(x|\d+)\s+)+(x|\d+))$/iu;

function back<T>(list: Array<T>): T {
  return list[list.length - 1];
}

function tokenizeDirective(key: string, value?: string) {
  key = KEY_ALIAS.get(key) ?? key;
  value = value?.trim();
  if (key.startsWith("start_of_")) {
    key = key.replace(/^start_of_/, "");
    return new Token(TokenType.StartEnv, key, value, []);
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
  if (key === "instrument") {
    // TODO: Consider splitting the name here already.
    return new Token(TokenType.Instrument, undefined, value);
  }
  return new Token(TokenType.Directive, key, value);
}

function addDirective(stack: Token[], token: Token): void {
  const children = back(stack).children;
  switch (token.type) {
    case TokenType.StartEnv:
      children.push(token);
      stack.push(token);
      break;
    case TokenType.EndEnv:
      if (stack.length <= 1) {
        throw new Error(
          `end_of_${token.key} directive does not have an opening directive.`
        );
      }
      stack.pop();
      const startEnv = back(back(stack).children);
      if (startEnv.key !== token.key) {
        throw new Error(
          `Closing environment end_of_${token.key} does not match opening ` +
            `environment start_of_${startEnv.key}.`
        );
      }
      break;
    default:
      children.push(token);
  }
}

function parseLine(stack: Token[], line: string, index: number, pos = 0): void {
  while (pos < line.length) {
    const children = back(stack).children;
    const match = line.slice(pos).match(FIRST_TOKEN);
    try {
      if (!match) {
        throw new Error("Failed to parse song file");
      }
      if (match[1]) {
        children.push(new Token(TokenType.Text, /*key=*/ undefined, match[1]));
      } else if (match[2]) {
        children.push(new Token(TokenType.Chord, /*key=*/ undefined, match[2]));
      } else if (match[3]) {
        const token = tokenizeDirective(match[3], match[4]);
        addDirective(stack, token);
      } else if (match[5]) {
        children.push(
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
}

function parseTabLine(stack: Token[], line: string, index: number): void {
  line = line.trim();
  if (!line.trim()) return;
  const tabParent = back(stack);
  if (line.trim().match(TAB_LINE)) {
    tabParent.children.push(
      new Token(TokenType.TabLine, /*key=*/ undefined, line.trim())
    );
    return;
  }
  const match = line.match(FIRST_TOKEN);
  if (match && match[3]) {
    const token = tokenizeDirective(match[3], match[4]);
    if (token.type === TokenType.EndEnv) {
      // For closing environment fall back to parsing lines and handle possible
      // errors inside parseLine.
      parseLine(stack, line, index);
      return;
    }
  }
  throw new Error(`Failed to read line of tab: ${index + 1}`);
}

export function tokenize(content: string): Token {
  const stack = new Array<Token>();
  stack.push(new Token(TokenType.StartEnv, "song", undefined, []));
  let activeToken = back(stack);
  const lines = content.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim().length) {
      if (
        activeToken.children.length &&
        back(activeToken.children).type != TokenType.Paragraph
      ) {
        activeToken.children.push(new Token(TokenType.Paragraph));
      }
      continue;
    }
    if (activeToken.key === "tab") {
      parseTabLine(stack, line, i);
    } else {
      parseLine(stack, line, i);
    }
    activeToken = back(stack);
    if (
      activeToken.children.length &&
      ADD_LINEBREAK_AFTER.has(back(activeToken.children).type)
    ) {
      activeToken.children.push(new Token(TokenType.LineBreak));
    }
  }
  if (back(activeToken.children).type === TokenType.Paragraph) {
    activeToken.children.pop();
  }
  if (stack.length !== 1) {
    throw new Error("File has unclosed environments.");
  }
  return stack[0];
}
