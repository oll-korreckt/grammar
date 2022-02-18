import { MarkdownHeading, MarkdownToken, MarkdownTokenType } from "@lib/utils/markdown-scanner";

export type ContainerType =
    | "idHeading"
    | "snippet"

export type Container =
    | IdHeading
    | Snippet

interface ContainerBase {
    type: ContainerType;
}

export interface IdHeading extends ContainerBase {
    type: "idHeading";
    id: string;
    heading: MarkdownHeading;
}

export interface Snippet extends ContainerBase {
    type: "snippet";
    name?: string;
    content: MarkdownToken[];
}

interface ParseData {
    tokens: MarkdownToken[];
    current: number;
    idHeadings: Set<string>;
    snippetNames: Set<string>;
}

function _idHeading(data: ParseData): Container {
    const currToken = _getCurrentToken(data);
    if (currToken.type === "comment.id") {
        const id = currToken.id;
        const { idHeadings } = data;
        if (idHeadings.has(id)) {
            throw `File contains multiple id headings for '${id}'`;
        }
        idHeadings.add(id);
        _advance(data);
        const headingToken = _getCurrentToken(data);
        if (headingToken.type !== "heading") {
            throw "heading ids must precede headings";
        }
        _advance(data);
        return {
            type: "idHeading",
            id: id,
            heading: headingToken
        };
    }
    return _snippet(data);
}

function _snippet(data: ParseData): Container {
    const currToken = _getCurrentToken(data);
    if (currToken.type === "comment.snippet") {
        _advance(data);
        return _finishNamedSnippet(data, currToken.name);
    } else {
        return _finishUnnamedSnippet(data);
    }
}

function _finishNamedSnippet(data: ParseData, name: string): Snippet {
    const content: MarkdownToken[] = [];
    let closeName: string | undefined = undefined;
    while (!_isAtEnd(data) && !_check(data, "comment.id")) {
        const currToken = _getCurrentToken(data);
        if (currToken.type === "comment.snippet") {
            closeName = currToken.name;
            _advance(data);
            break;
        }
        content.push(currToken);
        _advance(data);
    }
    if (closeName !== name) {
        throw `Named snippet '${name}' does not have a matching closing tag`;
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

function _finishUnnamedSnippet(data: ParseData): Snippet {
    const content: MarkdownToken[] = [];
    while (!_isAtEnd(data) && !_check(data, "comment.id", "comment.snippet")) {
        const currToken = _getCurrentToken(data);
        content.push(currToken);
        _advance(data);
    }
    return {
        type: "snippet",
        content
    };
}

function _isAtEnd(data: ParseData): boolean {
    return data.current >= data.tokens.length;
}

function _getCurrentToken(data: ParseData): MarkdownToken {
    const token = data.tokens[data.current];
    return token;
}

function _check(data: ParseData, ...tokenTypes: MarkdownTokenType[]): boolean {
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

function parse(markdown: MarkdownToken[]): Container[] {
    const data: ParseData = {
        current: 0,
        tokens: markdown,
        idHeadings: new Set(),
        snippetNames: new Set()
    };
    const content: Container[] = [];
    while (!_isAtEnd(data)) {
        const container = _idHeading(data);
        content.push(container);
    }
    return content;
}

export const MarkdownParser = {
    parse: parse
};