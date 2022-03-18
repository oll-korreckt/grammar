import { ElementClass, MarkdownToken, ParseContent, ParseObject, Snippet } from "./_types";

interface ParseData {
    tokens: MarkdownToken[];
    current: number;
    ids: Set<string>;
    snippetNames: Set<string>;
}

function _injection(data: ParseData): ParseObject {
    const currToken = _getCurrentToken(data);
    if (currToken.type === "comment.htmlInjection") {
        _advance(data);
        return {
            type: "htmlInjection",
            id: currToken.id
        };
    }
    return _elementId(data);
}

function _elementId(data: ParseData): ParseObject {
    const currToken = _getCurrentToken(data);
    if (currToken.type === "comment.id") {
        const id = currToken.id;
        const { ids } = data;
        if (ids.has(id)) {
            throw `File contains multiple id headings for '${id}'`;
        }
        ids.add(id);
        _advance(data);
        const nextToken = _elementClass(data);
        if (!ParseContent.isParseContent(nextToken)
            && nextToken.type !== "elementClass") {
            throw "content of an 'elementId' must be either a MarkdownToken or 'elementClass'";
        }
        _advance(data);
        return {
            type: "elementId",
            id: id,
            content: nextToken
        };
    }
    return _elementClass(data);
}

function _elementClass(data: ParseData): ParseObject {
    const currToken = _getCurrentToken(data);
    if (currToken.type === "comment.class") {
        const chain: MarkdownToken[] = [];
        while (!_isAtEnd(data) && _getCurrentToken(data).type === "comment.class") {
            chain.push(_getCurrentToken(data));
            _advance(data);
        }
        chain.push(_getCurrentToken(data));
        return _toElementClass(chain);
    }
    return _snippet(data);
}

function _toElementClass(chain: MarkdownToken[]): ElementClass {
    const classes: string[] = [];
    for (let index = 1; index < chain.length; index++) {
        const prev = chain[index - 1];
        if (prev.type !== "comment.class") {
            throw `Unexpected token of type '${prev.type}' found when trying to form ElementClass`;
        }
        classes.push(prev.className);
    }
    if (classes.length === 0) {
        throw "ElementClass needs at least 1 class";
    }
    const last = chain[chain.length - 1];
    if (!ParseContent.isParseContent(last)) {
        throw "ElementClass must contain a content element";
    }
    return {
        type: "elementClass",
        className: classes.length === 1 ? classes[0] : classes,
        content: last
    };
}

function _snippet(data: ParseData): ParseObject {
    const currToken = _getCurrentToken(data);
    if (currToken.type === "comment.snippet") {
        _advance(data);
        return _finishNamedSnippet(data, currToken.name);
    }
    return _parseContent(data);
}

function _parseContent(data: ParseData): ParseObject {
    const output = _getCurrentToken(data);
    if (!ParseContent.isParseContent(output)) {
        throw `Unexpected token of type '${output.type}'`;
    }
    _advance(data);
    return output;
}

function _finishNamedSnippet(data: ParseData, name: string): Snippet {
    const content: ParseContent[] = [];
    let hasClosingTag = false;
    while (!_isAtEnd(data)) {
        const currToken = _getCurrentToken(data);
        if (currToken.type === "comment.snippet") {
            if (currToken.name !== name) {
                throw `Named snippet '${name}' contains a different closing tag: '${currToken.name}'`;
            }
            _advance(data);
            hasClosingTag = true;
            break;
        }
        if (!ParseContent.isParseContent(currToken)) {
            throw `Snippet '${name}' contains invalid token of type '${currToken.type}'`;
        }
        content.push(currToken);
        _advance(data);
    }
    if (!hasClosingTag) {
        throw `Snippet '${name}' does not have a matching closing tag`;
    }
    const { snippetNames } = data;
    if (snippetNames.has(name)) {
        throw `File contains multiple named snippets for '${name}'`;
    }
    snippetNames.add(name);
    return {
        type: "snippet",
        name: name,
        content
    };
}

function _isAtEnd(data: ParseData): boolean {
    return data.current >= data.tokens.length;
}

function _getCurrentToken(data: ParseData): MarkdownToken {
    if (_isAtEnd(data)) {
        throw "at end";
    }
    const token = data.tokens[data.current];
    return token;
}

function _advance(data: ParseData): void {
    if (!_isAtEnd(data)) {
        data.current++;
    }
}

function parse(markdown: MarkdownToken[]): ParseObject[] {
    const data: ParseData = {
        current: 0,
        tokens: markdown,
        ids: new Set(),
        snippetNames: new Set()
    };
    const output: ParseObject[] = [];
    while (!_isAtEnd(data)) {
        const item = _injection(data);
        output.push(item);
    }
    return output;
}

export const MarkdownParser = {
    parse: parse
};