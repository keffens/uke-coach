export enum TokenType {
  Text,
  Chord,
  ChordDefinition,
  Metadata,
  Pattern,
  Instrument,
  InstrumentEnv,
  Directive,
  StartEnv,
  EndEnv,
  TabEnv,
  TabLine,
  FileComment,
  LineBreak,
  Paragraph,
}

export const ADD_LINEBREAK_AFTER = new Set([
  TokenType.Text,
  TokenType.Chord,
  TokenType.Pattern,
  TokenType.Directive,
]);

export class Token {
  constructor(
    readonly type: TokenType,
    readonly key: string = "",
    readonly value: string = "",
    readonly children: Token[] = [],
    readonly line: number = -1,
    readonly pos: number = -1
  ) {}

  /** Converts a token to its string representation */
  toString(includeChildren = true): string {
    switch (this.type) {
      case TokenType.Text:
        return this.value;
      case TokenType.Chord:
        return `[${this.value}]`;
      case TokenType.ChordDefinition:
        return `{chord: ${this.key} ${this.value}}\n`;
      case TokenType.Metadata:
        return `{${this.key}: ${this.value}}\n`;
      case TokenType.Pattern:
        return `{pattern: ${this.key} ${this.value}}`;
      case TokenType.Instrument:
        return `{instrument: ${this.value}}\n`;
      case TokenType.Directive:
        return `{${this.key}: ${this.value}}`;
      case TokenType.TabEnv:
      case TokenType.InstrumentEnv:
      case TokenType.StartEnv:
        if (includeChildren) {
          const inner = this.children.map((child) => child.toString()).join("");
          if (this.key === "song") return inner;
          return (
            `{start_of_${this.key}${this.value ? ": " + this.value : ""}}\n` +
            inner +
            (inner.endsWith("\n") ? "" : "\n") +
            `{end_of_${this.key}}\n`
          );
        }
        return `{start_of_${this.key}${this.value ? ": " + this.value : ""}}\n`;
      case TokenType.TabLine:
        return `${this.value}\n`;
      case TokenType.FileComment:
        return `# ${this.value}\n`;
      case TokenType.LineBreak:
        return "\n";
      case TokenType.Paragraph:
        return "\n";
      case TokenType.EndEnv:
      default:
        throw new Error(`Unexpected token type: ${this.type}`);
    }
  }

  /** Returns the error message augmented with token, line, and position. */
  errorMsg(msg: string): string {
    return (
      `Line ${this.line}, pos ${this.pos}, token "${this.toString()}": ` + msg
    );
  }

  /** Returns an error which includes the token with line and position. */
  error(msg: string): Error {
    return new Error(this.errorMsg(msg));
  }
}
