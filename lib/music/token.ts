export enum TokenType {
  Text,
  Chord,
  Metadata,
  Directive,
  StartEnv,
  EndEnv,
  FileComment,
  LineBreak,
  Paragraph,
}

export class Token {
  constructor(
    readonly type: TokenType,
    readonly value?: string,
    readonly key?: string
  ) {}
}
