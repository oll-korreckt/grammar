import { assert } from "chai";
import { Container, ContainerType, MarkdownParser } from "../markdown-parser";
import { MarkdownScanner } from "../markdown-scanner";
import { getTestFileContent, TokenResult } from "./utils";

interface ContainerResultBase {
    type: ContainerType;
}

interface SectionHeaderResult extends ContainerResultBase {
    type: "idHeading";
    id: string;
    heading: TokenResult;
}

interface SnippetResult extends ContainerResultBase {
    type: "snippet";
    name?: string;
    content: TokenResult[];
}

type ContainerResult =
    | SectionHeaderResult
    | SnippetResult;

function toContainerResult(result: Container): ContainerResult {
    switch (result.type) {
        case "idHeading":
            return {
                type: "idHeading",
                id: result.id,
                heading: TokenResult.toResult(result.heading)
            };
        case "snippet":
            const output: SnippetResult = {
                type: "snippet",
                content: result.content.map((token) => TokenResult.toResult(token))
            };
            if (result.name !== undefined) {
                output.name = result.name;
            }
            return output;
    }
}

function runParse(filename: string): ContainerResult[] {
    const content = getTestFileContent(filename);
    const tokens = MarkdownScanner.scan(content);
    return MarkdownParser
        .parse(tokens)
        .map((token) => toContainerResult(token));
}

describe("MarkdownParser", () => {
    test("parse", () => {
        const result = runParse("parser.md");
        const expected: ContainerResult[] = [
            {
                type: "idHeading",
                id: "link",
                heading: {
                    type: "heading",
                    depth: 1,
                    tokens: [{ type: "text", text: "Heading" }]
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
                type: "snippet",
                content: [{
                    type: "paragraph",
                    tokens: [{
                        type: "text",
                        text: "Unnamed section"
                    }]
                }]
            }
        ];
        assert.deepStrictEqual(result, expected);
    });

    describe("error", () => {
        test("heading links", () => {
            assert.throws(
                () => runParse("parser-heading-links.md"),
                /must precede headings/i
            );
        });

        test("multiple heading ids", () => {
            assert.throws(
                () => runParse("parser-multiple-ids.md"),
                /multiple id headings/i
            );
        });

        test("no closing tag", () => {
            assert.throws(
                () => runParse("parser-no-closing-tag.md"),
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