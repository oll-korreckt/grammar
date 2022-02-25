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
export interface MarkdownTable extends Omit<Tokens.Table, "header" | "rows"> {
    header: MarkdownTableCell[];
    rows: MarkdownTableCell[][];
}
export type MarkdownTableCell = RemoveTokens<Tokens.TableCell> & OverrideTokens;
export type MarkdownText = RemoveTokens<Tokens.Text>;
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