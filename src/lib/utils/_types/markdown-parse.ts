import { HTMLContent } from "./html-objects";
import { MarkdownCommentHTMLClass, MarkdownCommentHTMLInjection, MarkdownCommentId, MarkdownCommentSnippet, MarkdownToken, MarkdownTokenType } from "./markdown-tokens";

export type ParseObjectType =
    | "elementId"
    | "snippet"
    | "htmlInjection"
    | "elementClass"

export type ParseObject =
    | ParseContent
    | ElementId
    | Snippet
    | HTMLInjection
    | ElementClass

export type ParseContent = Exclude<MarkdownToken, MarkdownCommentId | MarkdownCommentSnippet | MarkdownCommentHTMLInjection | MarkdownCommentHTMLClass>;
export type ParseContentType = Exclude<MarkdownTokenType, "comment.id" | "comment.snippet" | "comment.htmlInjection" | "comment.class">;

interface ParseObjectBase {
    type: ParseObjectType;
}

export interface ElementId extends ParseObjectBase {
    type: "elementId";
    id: string;
    content: ElementClass | ParseContent;
}

export interface Snippet extends ParseObjectBase {
    type: "snippet";
    name: string;
    content: ParseContent[];
}

export interface HTMLInjection extends ParseObjectBase {
    type: "htmlInjection";
    id: string;
    content?: HTMLContent;
}

export interface ElementClass extends ParseObjectBase {
    type: "elementClass";
    className: string | string[];
    content: ParseContent;
}

const tokenTypes = new Set<ParseContentType>([
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
    "text"
]);

function isParseContent(obj: Record<string, any>): obj is ParseContent {
    return "type" in obj && tokenTypes.has(obj["type"]);
}

export const ParseContent = {
    isParseContent: isParseContent
};