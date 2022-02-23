import { MarkdownHeading, MarkdownHeadingDepth, MarkdownList, MarkdownListItem, MarkdownTable, MarkdownTableCell, MarkdownToken } from "@lib/utils/markdown-scanner";
import { Container } from "./markdown-parser";


export type HTMLObjectType =
    | "blockquote"
    | "br"
    | "code"
    | "del"
    | "italic" // from em
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "hr"
    | "image"
    | "link"
    | "ordered_list"
    | "unordered_list"
    | "table"
    | "header_row"
    | "tr"
    | "th"
    | "td"
    | "task_list"
    | "list_item"
    | "paragraph"
    | "bold" // from strong
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
    | HTMLLinkObject
    | HTMLOrderedListObject
    | HTMLUnorderedListObject
    | HTMLTableObject
    | HTMLTableHeaderObject
    | HTMLTableHeaderRowObject
    | HTMLTableRowObject
    | HTMLTableDataObject
    | HTMLTaskListObject
    | HTMLListItemObject
    | HTMLParagraphObject
    | HTMLBoldObject
    | HTMLCheckboxObject
type HTMLContent = undefined | HTMLObject | HTMLObject[];
interface HTMLObjectBase {
    type: HTMLObjectType;
    id?: string;
}
interface HTMLContentObject extends HTMLObjectBase {
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
    type: "italic";
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
    type: "image";
    src: string;
    alt: string;
}
export interface HTMLLinkObject extends HTMLContentObject {
    type: "link";
    href: string;
}
export interface HTMLOrderedListObject extends HTMLObjectBase {
    type: "ordered_list";
    items: HTMLListItemObject[];
}
export interface HTMLUnorderedListObject extends HTMLObjectBase {
    type: "unordered_list";
    items: HTMLListItemObject[];
}
export interface HTMLTaskListObject extends HTMLObjectBase {
    type: "task_list";
    items: HTMLListItemObject[];
}
export interface HTMLListItemObject extends HTMLContentObject {
    type: "list_item";
}
export interface HTMLParagraphObject extends HTMLContentObject {
    type: "paragraph";
}
export interface HTMLBoldObject extends HTMLContentObject {
    type: "bold";
}
export interface HTMLCheckboxObject extends HTMLObjectBase {
    type: "checkbox";
    checked?: true | undefined;
}
export interface HTMLTableObject extends HTMLObjectBase {
    type: "table";
    headers: HTMLTableHeaderRowObject;
    rows: HTMLTableRowObject[];
}
export type HTMLTableColumnAlign =
    | "left"
    | "right"
    | "center";
export interface HTMLTableHeaderRowObject extends HTMLObjectBase {
    type: "header_row";
    cells: HTMLTableHeaderObject[];
}
export interface HTMLTableHeaderObject extends HTMLContentObject {
    type: "th";
    align?: HTMLTableColumnAlign;
}
export interface HTMLTableRowObject extends HTMLObjectBase {
    type: "tr";
    cells: HTMLTableDataObject[];
}
export interface HTMLTableDataObject extends HTMLContentObject {
    type: "td";
}

function _setContent(obj: HTMLContentObject, content: HTMLContent): void {
    if (content === undefined
        || content === "") {
        return;
    }
    obj.content = content;
}

type HeadingType =
    | HTMLH1Object
    | HTMLH2Object
    | HTMLH3Object
    | HTMLH4Object
    | HTMLH5Object
    | HTMLH6Object
function _toHeading(obj: MarkdownHeading): HeadingType {
    const type: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" = `h${obj.depth}`;
    const output: HeadingType = { type };
    const content = _toHTMLContent(obj.tokens);
    _setContent(output, content);
    return output;
}

type ListType =
    | HTMLOrderedListObject
    | HTMLUnorderedListObject
    | HTMLTaskListObject
function _toList(obj: MarkdownList): ListType {
    const listType = _getListType(obj);
    const items = obj.items.map((item) => _toListItem(item));
    return {
        type: listType,
        items
    };
}

function _getListType(obj: MarkdownList): "ordered_list" | "unordered_list" | "task_list" {
    const hasTask = 1 << 0;
    const hasNonTask = 1 << 1;
    let state = 0;
    for (const item of obj.items) {
        if (item.task) {
            state |= hasTask;
        } else {
            state |= hasNonTask;
        }
    }
    switch (state) {
        case hasTask:
            return "task_list";
        case hasNonTask:
            return obj.ordered ? "ordered_list" : "unordered_list";
        case hasTask | hasNonTask:
            throw "cannot have a list that contains both task and non-task list items";
        default:
            throw "unhandled state";
    }
}

function _toListItem(obj: MarkdownListItem): HTMLListItemObject {
    let content: HTMLContent = _toHTMLContent(obj.tokens);
    if (obj.task) {
        const chkBox = _createCheckbox(obj);
        content = _insertCheckbox(chkBox, content);
    }
    const output: HTMLListItemObject = { type: "list_item" };
    _setContent(output, content);
    return output;
}

function _createCheckbox(obj: MarkdownListItem): HTMLCheckboxObject {
    const output: HTMLCheckboxObject = { type: "checkbox" };
    if (obj.checked) {
        output.checked = true;
    }
    return output;
}

function _insertCheckbox(chkBox: HTMLCheckboxObject, content: HTMLContent): HTMLContent {
    return content === undefined
        ? chkBox
        : Array.isArray(content)
            ? [chkBox, ...content]
            : [chkBox, content];
}

function _toHTMLObject(token: MarkdownToken): HTMLObject | undefined {
    switch (token.type) {
        // normal content types
        case "blockquote":
        case "del":
        case "paragraph": {
            const output: HTMLBlockquoteObject | HTMLDelObject | HTMLParagraphObject = {
                type: token.type
            };
            const content = _toHTMLContent(token.tokens);
            _setContent(output, content);
            return output;
        }
        // special content types
        case "link": {
            const output: HTMLLinkObject = {
                type: "link",
                href: token.href,
                content: _toHTMLContent(token.tokens)
            };
            return output;
        }
        case "code": {
            const output: HTMLCodeObject = {
                type: "code"
            };
            _setContent(output, token.text);
            return output;
        }
        // no content types
        case "br":
        case "hr":
            return {
                type: token.type
            };
        // ignored types
        case "space":
            return undefined;
        // mapped types
        case "em": {
            const output: HTMLItalicObject = {
                type: "italic"
            };
            const content = _toHTMLContent(token.tokens);
            _setContent(output, content);
            return output;
        }
        case "strong": {
            const output: HTMLBoldObject = {
                type: "bold"
            };
            const content = _toHTMLContent(token.tokens);
            _setContent(output, content);
            return output;
        }
        // unique types
        case "heading": {
            return _toHeading(token);
        }
        case "image": {
            const output: HTMLImageObject = {
                type: "image",
                src: token.href,
                alt: token.text
            };
            return output;
        }
        case "table": {
            const output: HTMLTableObject = {
                type: "table",
                headers: _getTableHeaders(token),
                rows: _getTableRows(token.rows)
            };
            return output;
        }
        case "text":
            return token.text !== ""
                ? token.text
                : undefined;
        case "list":
            return _toList(token);
        case "list_item":
            throw "'list_item' should only appear in the 'items' property of 'list' object";
    }
    throw `Unrecognized token of type '${token.type}'`;
}

function _toHTMLContent(tokens: MarkdownToken[]): HTMLContent {
    const output: HTMLObject[] = [];
    tokens.forEach((token) => {
        const htmlObj = _toHTMLObject(token);
        if (htmlObj !== undefined) {
            output.push(htmlObj);
        }
    });
    return output.length === 0
        ? undefined
        : output.length === 1
            ? output[0]
            : output;
}

function _getTableHeaders({ header, align }: MarkdownTable): HTMLTableHeaderRowObject {
    const output: HTMLTableHeaderObject[] = [];
    for (let index = 0; index < header.length; index++) {
        const headerCell = header[index];
        const headerAlign = align[index];
        const item: HTMLTableHeaderObject = {
            type: "th"
        };
        const content = _toHTMLContent(headerCell.tokens);
        _setContent(item, content);
        if (headerAlign !== null) {
            item.align = headerAlign;
        }
        output.push(item);
    }
    return {
        type: "header_row",
        cells: output
    };
}

function _getTableRows(rowTokens: MarkdownTableCell[][]): HTMLTableRowObject[] {
    return rowTokens.map((rowToken) => {
        return {
            type: "tr",
            cells: rowToken.map((cellToken) => {
                const cell: HTMLTableDataObject = {
                    type: "td"
                };
                const content = _toHTMLContent(cellToken.tokens);
                _setContent(cell, content);
                return cell;
            })
        };
    });
}

function _compileContainer(container: Container): HTMLObject[] {
    switch (container.type) {
        case "idHeading": {
            const output = _toHTMLObject(container.heading);
            switch (typeof output) {
                case "string":
                case "undefined":
                    throw "";
            }
            output.id = container.id;
            return [output];
        }
        case "snippet": {
            const output = _toHTMLContent(container.content);
            if (output === undefined) {
                throw "";
            }
            return Array.isArray(output) ? output : [output];
        }
    }
}

function compile(content: Container[]): HTMLObject | HTMLObject[] {
    const output: HTMLObject[] = [];
    content.forEach((container) => {
        const objs = _compileContainer(container);
        output.push(...objs);
    });
    return output.length === 1
        ? output[0]
        : output;
}

export const MarkdownCompiler = {
    compile: compile
};