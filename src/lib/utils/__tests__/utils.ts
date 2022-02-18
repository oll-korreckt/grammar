import fs from "fs";
import path from "path";
import { MarkdownToken, MarkdownTokenType } from "../markdown-scanner";

export interface TokenResult {
    type: MarkdownTokenType;
    tokens?: TokenResult[];
    items?: TokenResult[];
    href?: string;
    depth?: number;
    text?: string;
    name?: string;
    link?: string;
}

export function toResult(token: MarkdownToken): TokenResult {
    const output: TokenResult = { type: token.type };
    const tokens = (token as any).tokens as undefined | MarkdownToken[];
    if (tokens !== undefined) {
        output.tokens = tokens.map((t) => toResult(t));
    }
    const items = (token as any).items as undefined | MarkdownToken[];
    if (items !== undefined) {
        output.items = items.map((i) => toResult(i));
    }
    switch (token.type) {
        case "text":
            output.text = token.text;
            break;
        case "image":
            output.href = token.href;
            output.text = token.text;
            break;
        case "link":
            output.href = token.href;
            break;
        case "heading":
            output.depth = token.depth;
            break;
        case "comment_link":
            output.link = token.link;
            break;
        case "comment_snippet":
            output.name = token.name;
            break;
    }
    return output;
}

export const TokenResult = {
    toResult: toResult
};

export function getTestFileContent(filename: string): string {
    const filepath = path.join(__dirname, "markdown-files", filename);
    return fs.readFileSync(filepath).toString();
}