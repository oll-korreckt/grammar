import { MarkdownHeadingDepth } from "./markdown-tokens";

export type HTMLObjectType =
    | "blockquote"
    | "br"
    | "code"
    | "del"
    | "i" // from em
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "hr"
    | "img"
    | "a"
    | "table"
    | "thead"
    | "tbody"
    | "tr"
    | "th"
    | "td"
    | "ol"
    | "ul"
    | "tasklist"
    | "li"
    | "p"
    | "b" // from strong
    | "checkbox"
export type HTMLObject =
    | string
    | HTMLBlockquoteObject
    | HTMLBrObject
    | HTMLCodeObject
    | HTMLDelObject
    | HTMLItalicObject
    | HTMLH1Object
    | HTMLH2Object
    | HTMLH3Object
    | HTMLH4Object
    | HTMLH5Object
    | HTMLH6Object
    | HTMLHrObject
    | HTMLImageObject
    | HTMLAnchorObject
    | HTMLTableObject
    | HTMLTableHeaderObject
    | HTMLTableHeadObject
    | HTMLTableBodyObject
    | HTMLTableRowObject<"header">
    | HTMLTableRowObject<"data">
    | HTMLTableDataObject
    | HTMLOrderedListObject
    | HTMLUnorderedListObject
    | HTMLTaskListObject
    | HTMLListItemObject
    | HTMLParagraphObject
    | HTMLBoldObject
    | HTMLCheckboxObject
export type HTMLObjectMap<Type extends HTMLObjectType> = _HTMLObjectMap[Type];
type _HTMLObjectMap = {
    blockquote: HTMLBlockquoteObject;
    br: HTMLBrObject;
    code: HTMLCodeObject;
    del: HTMLDelObject;
    i: HTMLItalicObject;
    h1: HTMLH1Object;
    h2: HTMLH2Object;
    h3: HTMLH3Object;
    h4: HTMLH4Object;
    h5: HTMLH5Object;
    h6: HTMLH6Object;
    hr: HTMLHrObject;
    img: HTMLImageObject;
    a: HTMLAnchorObject;
    table: HTMLTableObject;
    thead: HTMLTableHeadObject;
    tbody: HTMLTableBodyObject;
    tr: HTMLTableRowObject;
    th: HTMLTableHeaderObject;
    td: HTMLTableDataObject;
    ol: HTMLOrderedListObject;
    ul: HTMLUnorderedListObject;
    tasklist: HTMLTaskListObject;
    li: HTMLListItemObject;
    p: HTMLParagraphObject;
    b: HTMLBoldObject;
    checkbox: HTMLCheckboxObject;
}
export type HTMLContent = undefined | HTMLObject | HTMLObject[];
interface HTMLObjectBase {
    type: HTMLObjectType;
    custom?: string;
    className?: string | string[];
    id?: string;
}
export interface HTMLContentObject extends HTMLObjectBase {
    content?: HTMLContent;
}
export interface HTMLBlockquoteObject extends HTMLContentObject {
    type: "blockquote";
}
export interface HTMLBrObject extends HTMLObjectBase {
    type: "br";
}
export interface HTMLCodeObject extends HTMLContentObject {
    type: "code";
}
export interface HTMLDelObject extends HTMLContentObject {
    type: "del";
}
export interface HTMLItalicObject extends HTMLContentObject {
    type: "i";
}
export type HTMLHeadingType = MarkdownHeadingDepth;
export interface HTMLH1Object extends HTMLContentObject {
    type: "h1";
}
export interface HTMLH2Object extends HTMLContentObject {
    type: "h2";
}
export interface HTMLH3Object extends HTMLContentObject {
    type: "h3";
}
export interface HTMLH4Object extends HTMLContentObject {
    type: "h4";
}
export interface HTMLH5Object extends HTMLContentObject {
    type: "h5";
}
export interface HTMLH6Object extends HTMLContentObject {
    type: "h6";
}
export interface HTMLHrObject extends HTMLObjectBase {
    type: "hr";
}
export interface HTMLImageObject extends HTMLObjectBase {
    type: "img";
    src: string;
    alt: string;
}
export interface HTMLAnchorObject extends HTMLContentObject {
    type: "a";
    href: string;
}
interface HTMLListBase extends HTMLObjectBase {
    items: HTMLListItemObject[];
}
export interface HTMLOrderedListObject extends HTMLListBase {
    type: "ol";
}
export interface HTMLUnorderedListObject extends HTMLListBase {
    type: "ul";
}
export interface HTMLTaskListObject extends HTMLListBase {
    type: "tasklist";
}
export interface HTMLListItemObject extends HTMLContentObject {
    type: "li";
}
export interface HTMLParagraphObject extends HTMLContentObject {
    type: "p";
}
export interface HTMLBoldObject extends HTMLContentObject {
    type: "b";
}
export interface HTMLCheckboxObject extends HTMLObjectBase {
    type: "checkbox";
    checked?: true | undefined;
}
export interface HTMLTableObject extends HTMLObjectBase {
    type: "table";
    head: HTMLTableHeadObject;
    body: HTMLTableBodyObject;
}
export type HTMLTableColumnAlign =
    | "left"
    | "right"
    | "center";
export interface HTMLTableHeaderObject extends HTMLContentObject {
    type: "th";
    align?: HTMLTableColumnAlign;
}
export interface HTMLTableHeadObject extends HTMLObjectBase {
    type: "thead";
    content: HTMLTableRowObject<"header">;
}
export interface HTMLTableBodyObject extends HTMLObjectBase {
    type: "tbody";
    content: HTMLTableRowObject<"data">[];
}
export type HTMLTableRowObject<Type extends "data" | "header" = "data"> =
    Type extends "data" ? DataRow
    : Type extends "header" ? HeaderRow : never;
interface DataRow extends HTMLObjectBase {
    type: "tr";
    cells: HTMLTableDataObject[];
}
interface HeaderRow extends HTMLObjectBase {
    type: "tr";
    cells: HTMLTableHeaderObject[];
}
export interface HTMLTableDataObject extends HTMLContentObject {
    type: "td";
}