import { marked } from "marked";
import Tokens = marked.Tokens;


type RemoveTokens<Type> = Omit<Type, "tokens">;
type OverrideTokens = { tokens: MarkdownToken[]; };
export type MarkdownBlockquote = RemoveTokens<Tokens.Blockquote> & OverrideTokens;
export type MarkdownBr = Tokens.Br;
export type MarkdownCode = Tokens.Code;
export type MarkdownCodespan = Tokens.Codespan;
export type MarkdownDef = Tokens.Def;
export type MarkdownDel = RemoveTokens<Tokens.Del> & OverrideTokens;
export type MarkdownEm = RemoveTokens<Tokens.Em> & OverrideTokens;
export type MarkdownEscape = Tokens.Escape;
export type MarkdownHTML = Tokens.HTML;
export type MarkdownHeading = Omit<RemoveTokens<Tokens.Heading> & OverrideTokens, "depth"> & { depth: MarkdownHeadingDepth; };
export type MarkdownHeadingDepth =
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
export type MarkdownHr = Tokens.Hr;
export type MarkdownImage = Tokens.Image;
export type MarkdownLink = RemoveTokens<Tokens.Link> & OverrideTokens;
export type MarkdownList = Omit<Tokens.List, "items"> & { items: MarkdownListItem[]; };
export type MarkdownListItem = RemoveTokens<Tokens.ListItem> & OverrideTokens;
export type MarkdownParagraph = RemoveTokens<Tokens.Paragraph> & OverrideTokens;
export type MarkdownSpace = Tokens.Space;
export type MarkdownStrong = RemoveTokens<Tokens.Strong> & OverrideTokens;
export type MarkdownTable = Tokens.Table;
export type MarkdownText = Tokens.Text;
export interface MarkdownCommentId extends Omit<Tokens.HTML, "type"> {
    type: "comment.id";
    id: string;
}
export interface MarkdownCommentSnippet extends Omit<Tokens.HTML, "type"> {
    type: "comment.snippet";
    name: string;
}

export type MarkdownToken =
    | MarkdownBlockquote
    | MarkdownBr
    | MarkdownCode
    | MarkdownCodespan
    | MarkdownCommentId
    | MarkdownCommentSnippet
    | MarkdownDef
    | MarkdownDel
    | MarkdownEm
    | MarkdownEscape
    | MarkdownHTML
    | MarkdownHeading
    | MarkdownHr
    | MarkdownImage
    | MarkdownLink
    | MarkdownList
    | MarkdownListItem
    | MarkdownParagraph
    | MarkdownSpace
    | MarkdownStrong
    | MarkdownTable
    | MarkdownText
export type MarkdownTokenType =
    | "blockquote"
    | "br"
    | "code"
    | "codespan"
    | "comment.id"
    | "comment.snippet"
    | "def"
    | "del"
    | "em"
    | "escape"
    | "html"
    | "heading"
    | "hr"
    | "image"
    | "link"
    | "list"
    | "list_item"
    | "paragraph"
    | "space"
    | "strong"
    | "table"
    | "text"

function _isTag(value: marked.Token): value is Tokens.Tag {
    switch (value.type) {
        case "text":
        case "html":
            return "inLink" in value && "inRawBlock" in value;
        default:
            return false;
    }
}

function _toMarkdownHeadingDepth(value: number): MarkdownHeadingDepth {
    if (value < 1 || value > 6) {
        throw `value '${value}' is not a valid heading depth`;
    }
    return value as MarkdownHeadingDepth;
}

function _toMarkdownToken(token: marked.Token): MarkdownToken {
    if (_isTag(token)) {
        throw "cannot use tag tokens";
    }
    switch (token.type) {
        // tokens that are just aliases
        case "br":
        case "code":
        case "codespan":
        case "def":
        case "escape":
        case "hr":
        case "image":
        case "space":
        case "table":
        case "text":
            return token;
        // tokens with a 'tokens' property
        case "blockquote":
        case "del":
        case "em":
        case "link":
        case "list_item":
        case "paragraph":
        case "strong":
            return {
                ...token,
                tokens: _toMarkdownTokens(token.tokens)
            };
        // special tokens
        case "heading":
            return {
                ...token,
                depth: _toMarkdownHeadingDepth(token.depth),
                tokens: _toMarkdownTokens(token.tokens)
            };
        case "html":
            return _toHTMLToken(token);
        case "list":
            return {
                ...token,
                items: token.items.map((item) => {
                    return {
                        ...item,
                        tokens: _toMarkdownTokens(item.tokens)
                    };
                })
            };
    }
}

function _extractCommentText(comment: string): string {
    const trimmedComment = comment.trim();
    const startIndex = "<!--".length;
    const endIndex = trimmedComment.length - "-->".length - 1;
    return trimmedComment.slice(startIndex, endIndex).trim();
}

function _toHTMLToken(token: Tokens.HTML): MarkdownHTML | MarkdownCommentId | MarkdownCommentSnippet {
    const commentText = _extractCommentText(token.text);
    if (commentText.startsWith("#")) {
        return {
            ...token,
            type: "comment.id",
            id: commentText.slice(1)
        };
    } else if (commentText.startsWith("!")) {
        return {
            ...token,
            type: "comment.snippet",
            name: commentText.slice(1)
        };
    } else {
        return token;
    }
}

function _toMarkdownTokens(tokens: marked.Token[]): MarkdownToken[] {
    return tokens.map((token) => _toMarkdownToken(token));
}

function scan(content: string): MarkdownToken[] {
    const tokens = _toMarkdownTokens(marked.lexer(content));
    return tokens;
}

export const MarkdownScanner = {
    scan: scan
};