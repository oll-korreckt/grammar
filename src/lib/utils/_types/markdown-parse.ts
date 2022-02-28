import { HTMLContent } from "./html-objects";
import { MarkdownHeading, MarkdownToken } from "./markdown-tokens";

export type ParseObjectType =
    | "idHeading"
    | "snippet"
    | "htmlInjection"

export type ParseObject =
    | IdHeading
    | Snippet
    | HTMLInjection

interface ParseObjectBase {
    type: ParseObjectType;
}

export interface IdHeading extends ParseObjectBase {
    type: "idHeading";
    id: string;
    heading: MarkdownHeading;
}

export interface Snippet extends ParseObjectBase {
    type: "snippet";
    name?: string;
    content: MarkdownToken[];
}

export interface HTMLInjection extends ParseObjectBase {
    type: "htmlInjection";
    id: string;
    content?: HTMLContent;
}