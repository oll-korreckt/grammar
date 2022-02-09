import { marked } from "marked";

export type MarkdownTokenType =
    | "paragraph"
    // | "space"
    | "text"
    | "heading"
    | "link"
    | "italic"
    | "bold"
export type MarkdownToken =
    | MarkdownParagraph
    // | MarkdownSpace
    | MarkdownText
    | MarkdownHeading
    | MarkdownLink
    | MarkdownItalic
    | MarkdownBold
export interface MarkdownParagraph {
    type: "paragraph";
    tokens: MarkdownToken[];
}
// export interface MarkdownSpace {
//     type: "space";
//     content: string;
// }
export interface MarkdownText {
    type: "text";
    content: string;
}
export interface MarkdownHeading {
    type: "heading";
    headingType: HeadingType;
    tokens: MarkdownToken[];
}
export interface MarkdownLink {
    type: "link";
    link: string;
    tokens: MarkdownToken[];
}
export interface MarkdownItalic {
    type: "italic";
    tokens: MarkdownToken[];
}
export interface MarkdownBold {
    type: "bold";
    tokens: MarkdownToken[];
}
export type HeadingType =
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6

type LexTokenType = marked.Token["type"];
type LexToken = marked.Token;


function toTokens(rawMarkdown: string): MarkdownToken[] {
    const preOutput = marked.lexer(rawMarkdown);
    return _toMarkdownTokens(preOutput);
}

function _toMarkdownTokens(lTokens: LexToken[]): MarkdownToken[] {
    return lTokens.map((lToken) => _toMarkdownToken(lToken));
}

function _toMarkdownToken(lToken: LexToken): MarkdownToken {
    switch (lToken.type) {
        case "paragraph":
            return _toMarkdownParagraph(lToken);
        case "text":
            return _toMarkdownText(lToken);
        case "heading":
            return _toMarkdownHeading(lToken);
        case "link":
            return _toMarkdownLink(lToken);
        case "em":
            return _toMarkdownItalic(lToken);
        case "strong":
            return _toMarkdownBold(lToken);
        default:
            throw `Unhandled token type '${lToken.type}'`;
    }
}

function _toMarkdownParagraph(lToken: marked.Tokens.Paragraph): MarkdownParagraph {
    return {
        type: "paragraph",
        tokens: _toMarkdownTokens(lToken.tokens)
    };
}

function _toMarkdownText(lToken: marked.Tokens.Text | marked.Tokens.Tag): MarkdownText {
    return {
        type: "text",
        content: lToken.text
    };
}

// function _toMarkdownSpace(lToken: marked.Tokens.Space): MarkdownSpace {
//     return {
//         type: "space",
//         content: lToken.raw
//     };
// }

function _toMarkdownLink(lToken: marked.Tokens.Link): MarkdownLink {
    return {
        type: "link",
        link: lToken.href,
        tokens: _toMarkdownTokens(lToken.tokens)
    };
}

function _toMarkdownHeading({ depth, tokens }: marked.Tokens.Heading): MarkdownHeading {
    if (depth < 1 || depth > 6) {
        throw `Unhandled heading depth of '${depth}'`;
    }
    return {
        type: "heading",
        headingType: depth as HeadingType,
        tokens: _toMarkdownTokens(tokens)
    };
}

function _toMarkdownItalic(lToken: marked.Tokens.Em): MarkdownItalic {
    return {
        type: "italic",
        tokens: _toMarkdownTokens(lToken.tokens)
    };
}

function _toMarkdownBold(lToken: marked.Tokens.Strong): MarkdownBold {
    return {
        type: "bold",
        tokens: _toMarkdownTokens(lToken.tokens)
    };
}

export const Markdown = {
    toTokens: toTokens
};