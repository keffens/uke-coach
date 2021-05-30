export enum TokenType {
  Text,
  Chord,
  ChordDefinition,
  Metadata,
  Pattern,
  Instrument,
  Directive,
  StartEnv,
  EndEnv,
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
    readonly children: Token[] = []
  ) {}

  /** Converts a token to its string representation */
  toString(): string {
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
        return `{pattern: ${this.key} ${this.value}}`;
      case TokenType.Directive:
        return `{${this.key}: ${this.value}}`;
      case TokenType.StartEnv:
        const inner = this.children.map((child) => child.toString()).join("");
        if (this.key === "song") return inner;
        return (
          `{start_of_${this.key}${this.value ? ": " + this.value : ""}}\n` +
          inner +
          `{end_of_${this.key}}\n`
        );
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
}
