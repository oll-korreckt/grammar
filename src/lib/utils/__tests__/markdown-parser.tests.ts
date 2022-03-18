import { assert } from "chai";
import { ParseObject, ParseObjectType } from "..";
import { MarkdownParser } from "../markdown-parser";
import { MarkdownScanner } from "../markdown-scanner";
import { ParseContent } from "../_types";
import { getTestFileContent, TokenResult } from "./utils";

interface ParseResultBase {
    type: ParseObjectType;
}

interface ElementIdResult extends ParseResultBase {
    type: "elementId";
    id: string;
    content: TokenResult | ElementClassResult;
}

interface SnippetResult extends ParseResultBase {
    type: "snippet";
    name: string;
    content: TokenResult[];
}

interface HTMLInjectionResult extends ParseResultBase {
    type: "htmlInjection";
    id: string;
}

interface ElementClassResult extends ParseResultBase {
    type: "elementClass";
    className: string | string[];
    content: TokenResult;
}

type ParseResult =
    | TokenResult
    | ElementIdResult
    | SnippetResult
    | HTMLInjectionResult
    | ElementClassResult

function toParseResult(result: ParseObject): ParseResult {
    if (ParseContent.isParseContent(result)) {
        return TokenResult.toResult(result);
    }
    switch (result.type) {
        case "elementId":
            return {
                type: "elementId",
                id: result.id,
                content: ParseContent.isParseContent(result.content)
                    ? TokenResult.toResult(result.content)
                    : toParseResult(result.content) as ElementClassResult
            };
        case "snippet": {
            const output: SnippetResult = {
                type: "snippet",
                name: result.name,
                content: result.content.map((token) => TokenResult.toResult(token))
            };
            if (result.name !== undefined) {
                output.name = result.name;
            }
            return output;
        }
        case "htmlInjection": {
            return {
                type: "htmlInjection",
                id: result.id
            };
        }
        case "elementClass": {
            return {
                type: "elementClass",
                className: result.className,
                content: TokenResult.toResult(result.content)
            };
        }
    }
}

function runParse(filename: string): ParseResult[] {
    const content = getTestFileContent(filename);
    const tokens = MarkdownScanner.scan(content);
    return MarkdownParser
        .parse(tokens)
        .map((token) => toParseResult(token));
}

describe("MarkdownParser", () => {
    test("parse", () => {
        const result = runParse("parser.md");
        const expected: ParseResult[] = [
            {
                type: "elementId",
                id: "link",
                content: {
                    type: "elementClass",
                    className: ["firstClass", "secondClass"],
                    content: {
                        type: "heading",
                        depth: 1,
                        tokens: [{ type: "text", text: "Heading" }]
                    }
                }
            },
            {
                type: "snippet",
                name: "section",
                content: [{
                    type: "paragraph",
                    tokens: [{
                        type: "text",
                        text: "Here is a section"
                    }]
                }]
            },
            {
                type: "paragraph",
                tokens: [{ type: "text", text: "Unnamed section" }]
            },
            {
                type: "htmlInjection",
                id: "injection"
            }
        ];
        assert.deepStrictEqual(result, expected);
    });

    test("ids and classes", () => {
        const result = runParse("ids-classes.md");
        const expected: ParseResult[] = [
            {
                type: "elementId",
                id: "id1",
                content: {
                    type: "elementClass",
                    className: ["class1", "class2", "class3"],
                    content: {
                        type: "heading",
                        depth: 1,
                        tokens: [{ type: "text", text: "This is a header" }]
                    }
                }
            },
            {
                type: "elementClass",
                className: "class1",
                content: {
                    type: "paragraph",
                    tokens: [{ type: "text", text: "No id" }]
                }
            },
            {
                type: "elementId",
                id: "id2",
                content: {
                    type: "heading",
                    depth: 3,
                    tokens: [{ type: "text", text: "No class(es)" }]
                }
            }
        ];
        assert.deepStrictEqual(result, expected);
    });

    describe("error", () => {
        test("multiple heading ids", () => {
            assert.throws(
                () => runParse("parser-multiple-ids.md"),
                /multiple id headings/i
            );
        });

        test("snippet: invalid token", () => {
            assert.throws(
                () => runParse("parser-snippet-invalid-token.md"),
                /contains invalid token/i
            );
        });

        test("snippet: different closing tag", () => {
            assert.throws(
                () => runParse("parser-snippet-diff-closing-tag.md"),
                /contains a different closing tag/i
            );
        });

        test("snippet: no closing tag", () => {
            assert.throws(
                () => runParse("parser-snippet-no-closing-tag.md"),
                /does not have a matching closing tag/i
            );
        });

        test("multiple named snippets", () => {
            assert.throws(
                () => runParse("parser-multiple-named-snippets.md"),
                /multiple named snippets/i
            );
        });
    });
});