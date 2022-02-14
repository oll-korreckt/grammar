import { marked } from "marked";
import Tokens = marked.Tokens;

export interface End {
    type: "end";
}
export type MarkedToken =
    | Tokens.Blockquote
    | Tokens.Br
    | Tokens.Code
    | Tokens.Codespan
    | Tokens.Def
    | Tokens.Del
    | Tokens.Em
    | Tokens.Escape
    | Tokens.HTML
    | Tokens.Heading
    | Tokens.Hr
    | Tokens.Image
    | Tokens.Link
    | Tokens.List
    | Tokens.ListItem
    | Tokens.Paragraph
    | Tokens.Space
    | Tokens.Strong
    | Tokens.Table
    | Tokens.Text
    | End
export type MarkedTokenType =
    | marked.Token["type"]
    | "end";
type MarkedTokenTypeArray = [
    "blockquote",
    "br",
    "code",
    "codespan",
    "def",
    "del",
    "em",
    "escape",
    "html",
    "heading",
    "hr",
    "image",
    "link",
    "list",
    "list_item",
    "paragraph",
    "space",
    "strong",
    "table",
    "text",
    "end"
];
export type MarkedTokenTypeMapper<Type extends MarkedTokenType> =
    Type extends "blockquote" ? Tokens.Blockquote
    : Type extends "br" ? Tokens.Br
    : Type extends "code" ? Tokens.Code
    : Type extends "codespan" ? Tokens.Codespan
    : Type extends "def" ? Tokens.Def
    : Type extends "del" ? Tokens.Del
    : Type extends "em" ? Tokens.Em
    : Type extends "escape" ? Tokens.Escape
    : Type extends "html" ? Tokens.HTML
    : Type extends "heading" ? Tokens.Heading
    : Type extends "hr" ? Tokens.Hr
    : Type extends "image" ? Tokens.Image
    : Type extends "link" ? Tokens.Link
    : Type extends "list" ? Tokens.List
    : Type extends "list_item" ? Tokens.ListItem
    : Type extends "paragraph" ? Tokens.Paragraph
    : Type extends "space" ? Tokens.Space
    : Type extends "strong" ? Tokens.Strong
    : Type extends "table" ? Tokens.Table
    : Type extends "text" ? Tokens.Text
    : Type extends "end" ? End
    : never;

export type ContainerType =
    | "headingLink"
    | "snippet"

export type Container =
    | HeadingLink
    | Snippet

interface ContainerBase {
    containerType: ContainerType;
}

export interface Page {
    content: Container[];
}

export interface HeadingLink extends ContainerBase {
    containerType: "headingLink";
    link: string;
    heading: Tokens.Heading;
}

export interface Snippet extends ContainerBase {
    containerType: "snippet";
    name?: string;
    content: MarkedToken[];
}

interface ParseData {
    tokens: MarkedToken[];
    current: number;
}

function _extractCommentText(comment: string): string {
    const startIndex = "<!--".length;
    const endIndex = comment.length - "-->".length - 1;
    return comment.slice(startIndex, endIndex).trim();
}

type IsLink =
    | { isLink: true; link: string; }
    | { isLink: false; }

function _isLinkComment(token: MarkedToken): IsLink {
    if (token.type !== "html") {
        return { isLink: false };
    }
    const commentText = _extractCommentText(token.text);
    return commentText.startsWith("#")
        ? { isLink: true, link: commentText.slice(1) }
        : { isLink: false };
}

type IsSnippet =
    | { isSnippet: true; name: string; }
    | { isSnippet: false; }

function _isSnippetComment(token: MarkedToken): IsSnippet {
    if (token.type !== "html") {
        return { isSnippet: false };
    }
    const commentText = _extractCommentText(token.text);
    return commentText.startsWith("!")
        ? { isSnippet: true, name: commentText.slice(1) }
        : { isSnippet: false };
}

function _headingLink(data: ParseData): Container {
    const currToken = _getCurrentToken(data);
    const isLink = _isLinkComment(currToken);
    if (isLink.isLink) {
        _advance(data);
        const headingToken = _getCurrentToken(data);
        if (headingToken.type !== "heading") {
            throw "heading links must precede headings";
        }
        _advance(data);
        return {
            containerType: "headingLink",
            link: isLink.link,
            heading: headingToken
        };
    }
    return _snippet(data);
}

function _snippet(data: ParseData): Container {
    let currToken = _getCurrentToken(data);
    const isOpenSnippet = _isSnippetComment(currToken);
    if (isOpenSnippet.isSnippet) {
        _advance(data);
    }
    const content: MarkedToken[] = [];
    while (!_isAtEnd(data)) {
        currToken = _getCurrentToken(data);
        const isCloseSnippet = _isSnippetComment(currToken);
        if (isCloseSnippet.isSnippet) {
            _advance(data);
            if (!isOpenSnippet.isSnippet) {
                return { containerType: "snippet", content };
            }
            if (isOpenSnippet.name !== isCloseSnippet.name) {
                throw "snippets not equal";
            }
            return {
                containerType: "snippet",
                name: isOpenSnippet.name,
                content
            };
        }
        content.push(currToken);
        _advance(data);
    }
    if (isOpenSnippet.isSnippet) {
        throw "unclosed snippet";
    }
    return {
        containerType: "snippet",
        content
    };
}

function _isAtEnd(data: ParseData): boolean {
    return _getCurrentToken(data).type === "end";
}

function _getCurrentToken(data: ParseData): MarkedToken {
    const token = data.tokens[data.current];
    return token;
}

function _check(data: ParseData, ...tokenTypes: MarkedTokenType[]): boolean {
    const currToken = _getCurrentToken(data);
    for (const tokenType of tokenTypes) {
        if (currToken.type === tokenType) {
            return true;
        }
    }
    return false;
}

function _advance(data: ParseData): void {
    if (!_isAtEnd(data)) {
        data.current++;
    }
}

function parsePage(pageContent: string): Container[] {
    const data: ParseData = {
        current: 0,
        tokens: [
            ...marked.lexer(pageContent) as MarkedToken[],
            { type: "end" }
        ]
    };
    const content: Container[] = [];
    while (!_isAtEnd(data)) {
        const container = _headingLink(data);
        content.push(container);
    }
    return content;
}

export const ElementMarkdownParser = {
    parsePage: parsePage
};