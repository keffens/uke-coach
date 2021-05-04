export enum TokenType {
  Text,
  Chord,
  ChordDefinition,
  Metadata,
  Pattern,
  Directive,
  StartEnv,
  EndEnv,
  FileComment,
  LineBreak,
  Paragraph,
}

export const NONEMPTY_TOKENS = new Set([
  TokenType.Text,
  TokenType.Chord,
  TokenType.Metadata,
  TokenType.Directive,
  TokenType.StartEnv,
  TokenType.EndEnv,
]);

export class Token {
  constructor(
    readonly type: TokenType,
    readonly key?: string,
    readonly value?: string,
    readonly children?: Token[]
  ) {}
}
