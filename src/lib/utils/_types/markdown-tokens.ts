import { marked } from "marked";

type RemoveTokens<Type> = Omit<Type, "tokens">;
type OverrideTokens = { tokens: MarkdownToken[]; };
export type MarkdownBlockquote = RemoveTokens<marked.Tokens.Blockquote> & OverrideTokens;
export type MarkdownBr = marked.Tokens.Br;
export type MarkdownCode = marked.Tokens.Code;
export type MarkdownCodespan = marked.Tokens.Codespan;
export type MarkdownDef = marked.Tokens.Def;
export type MarkdownDel = RemoveTokens<marked.Tokens.Del> & OverrideTokens;
export type MarkdownEm = RemoveTokens<marked.Tokens.Em> & OverrideTokens;
export type MarkdownEscape = marked.Tokens.Escape;
export type MarkdownHTML = marked.Tokens.HTML;
export type MarkdownHeading = Omit<RemoveTokens<marked.Tokens.Heading> & OverrideTokens, "depth"> & { depth: MarkdownHeadingDepth; };
export type MarkdownHeadingDepth =
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
export type MarkdownHr = marked.Tokens.Hr;
export type MarkdownImage = marked.Tokens.Image;
export type MarkdownLink = RemoveTokens<marked.Tokens.Link> & OverrideTokens;
export type MarkdownList = Omit<marked.Tokens.List, "items"> & { items: MarkdownListItem[]; };
export type MarkdownListItem = RemoveTokens<marked.Tokens.ListItem> & OverrideTokens;
export type MarkdownParagraph = RemoveTokens<marked.Tokens.Paragraph> & OverrideTokens;
export type MarkdownSpace = marked.Tokens.Space;
export type MarkdownStrong = RemoveTokens<marked.Tokens.Strong> & OverrideTokens;
export interface MarkdownTable extends Omit<marked.Tokens.Table, "header" | "rows"> {
    header: MarkdownTableCell[];
    rows: MarkdownTableCell[][];
}
export type MarkdownTableCell = RemoveTokens<marked.Tokens.TableCell> & OverrideTokens;
export type MarkdownText = RemoveTokens<marked.Tokens.Text>;
export interface MarkdownCommentId extends Omit<marked.Tokens.HTML, "type"> {
    type: "comment.id";
    id: string;
}
export interface MarkdownCommentSnippet extends Omit<marked.Tokens.HTML, "type"> {
    type: "comment.snippet";
    name: string;
}
export interface MarkdownCommentHTMLInjection extends Omit<marked.Tokens.HTML, "type"> {
    type: "comment.htmlInjection";
    id: string;
}

export type MarkdownToken =
    | MarkdownBlockquote
    | MarkdownBr
    | MarkdownCode
    | MarkdownCodespan
    | MarkdownCommentId
    | MarkdownCommentSnippet
    | MarkdownCommentHTMLInjection
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
    | "comment.htmlInjection"
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