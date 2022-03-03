import fs from "fs";
import path from "path";
import { MarkdownTable, MarkdownTableCell, MarkdownToken, MarkdownTokenType } from "..";

export interface TokenResult {
    type: MarkdownTokenType;
    tokens?: TokenResult[];
    items?: TokenResult[];
    href?: string;
    depth?: number;
    text?: string;
    name?: string;
    id?: string;
    header?: TableCellResult[];
    rows?: TableCellResult[][];
    align?: MarkdownTable["align"];
}

export interface TableCellResult {
    tokens: TokenResult[];
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
        case "code":
        case "codespan":
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
        case "comment.id":
            output.id = token.id;
            break;
        case "comment.snippet":
            output.name = token.name;
            break;
        case "comment.htmlInjection":
            output.id = token.id;
            break;
        case "table":
            output.align = token.align;
            output.header = toTableCellResult(token.header);
            output.rows = token.rows.map((row) => toTableCellResult(row));
            break;
    }
    return output;
}

function toTableCellResult(tableCells: MarkdownTableCell[]): TableCellResult[] {
    return tableCells.map((cell) => {
        return {
            tokens: cell.tokens.map((token) => toResult(token))
        };
    });
}

export const TokenResult = {
    toResult: toResult
};

export function getTestFileContent(filename: string): string {
    const filepath = path.join(__dirname, "markdown-files", filename);
    return fs.readFileSync(filepath).toString();
}