import { HTMLAnchorObject, HTMLBlockquoteObject, HTMLBoldObject, HTMLCheckboxObject, HTMLCodeObject, HTMLContent, HTMLContentObject, HTMLDelObject, HTMLH1Object, HTMLH2Object, HTMLH3Object, HTMLH4Object, HTMLH5Object, HTMLH6Object, HTMLImageObject, HTMLItalicObject, HTMLListItemObject, HTMLObject, HTMLOrderedListObject, HTMLParagraphObject, HTMLTableDataObject, HTMLTableHeaderObject, HTMLTableObject, HTMLTableRowObject, HTMLTaskListObject, HTMLUnorderedListObject, MarkdownHeading, MarkdownList, MarkdownListItem, MarkdownTable, MarkdownTableCell, MarkdownToken, ParseObject, Snippet } from "./_types";

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

function _toList(obj: MarkdownList): HTMLOrderedListObject | HTMLUnorderedListObject | HTMLTaskListObject {
    const listType = _getListType(obj);
    const items = obj.items.map((item) => _toListItem(item));
    return {
        type: listType,
        items
    };
}

function _getListType(obj: MarkdownList): "ol" | "ul" | "tasklist" {
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
            return "tasklist";
        case hasNonTask:
            return obj.ordered ? "ol" : "ul";
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
    const output: HTMLListItemObject = { type: "li" };
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
                type: token.type === "paragraph"
                    ? "p"
                    : token.type
            };
            const content = _toHTMLContent(token.tokens);
            _setContent(output, content);
            return output;
        }
        // special content types
        case "link": {
            const output: HTMLAnchorObject = {
                type: "a",
                href: token.href,
                content: _toHTMLContent(token.tokens)
            };
            return output;
        }
        case "code":
        case "codespan": {
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
        // mapped types
        case "em": {
            const output: HTMLItalicObject = {
                type: "i"
            };
            const content = _toHTMLContent(token.tokens);
            _setContent(output, content);
            return output;
        }
        case "strong": {
            const output: HTMLBoldObject = {
                type: "b"
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
                type: "img",
                src: token.href,
                alt: token.text
            };
            return output;
        }
        case "table": {
            const output: HTMLTableObject = {
                type: "table",
                head: {
                    type: "thead",
                    content: _getTableHeaders(token)
                },
                body: {
                    type: "tbody",
                    content: _getTableRows(token.rows)
                }
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

function _getTableHeaders({ header, align }: MarkdownTable): HTMLTableRowObject<"header"> {
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
        type: "tr",
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

function isHTMLElement(value: HTMLContent): value is Exclude<HTMLObject, string> {
    return value !== undefined
        && !Array.isArray(value)
        && typeof value !== "string";
}

function _compileObject(parseObj: ParseObject): HTMLContent {
    switch (parseObj.type) {
        case "elementId": {
            const output = _compileObject(parseObj.content);
            if (!isHTMLElement(output)) {
                throw `id '${parseObj.id}' is not associated with an element`;
            }
            output.id = parseObj.id;
            return output;
        }
        case "elementClass": {
            const output = _compileObject(parseObj.content);
            if (!isHTMLElement(output)) {
                const { className } = parseObj;
                throw `class '${className}' is not associated with an element`;
            }
            output.className = parseObj.className;
            return output;
        }
        case "snippet": {
            const output = _compileSnippetContent(parseObj.content);
            if (output === undefined) {
                throw `Snippet '${parseObj.name}' does not contain any content`;
            }
            return output;
        }
        case "htmlInjection": {
            return parseObj.content;
        }
        case "custom": {
            const output = _compileObject(parseObj.content);
            if (!isHTMLElement(output)) {
                const { customValue } = parseObj;
                throw `custom value '${customValue}' is not associated with an element`;
            }
            output.custom = parseObj.customValue;
            return output;
        }
        default:
            return _toHTMLContent([parseObj]);
    }
}

function _compileSnippetContent(content: Exclude<ParseObject, Snippet>[]): HTMLContent {
    const output: HTMLObject[] = [];
    for (let index = 0; index < content.length; index++) {
        const obj = content[index];
        const rawItem = _compileObject(obj);
        const fmtItem = rawItem !== undefined
            ? Array.isArray(rawItem)
                ? rawItem
                : [rawItem]
            : [];
        output.push(...fmtItem);
    }
    return output.length === 0
        ? undefined
        : output.length === 1
            ? output[0]
            : output;
}

function compile(content: ParseObject[]): HTMLObject | HTMLObject[] {
    const output: HTMLObject[] = [];
    content.forEach((container) => {
        const obj = _compileObject(container);
        if (obj !== undefined) {
            const items = Array.isArray(obj) ? obj : [obj];
            output.push(...items);
        }
    });
    return output.length === 1
        ? output[0]
        : output;
}

export const MarkdownCompiler = {
    compile: compile
};