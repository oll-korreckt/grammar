export type TokenType = "word" | "whitespace" | "end";

export interface Token {
    lexeme: string;
    tokenType: TokenType;
}
