import { assert } from "chai";
import { MarkdownScanner } from "../markdown-scanner";
import { getTestFileContent, TokenResult, toResult } from "./utils";


function runScan(content: string): TokenResult[] {
    return MarkdownScanner.scan(content).map((token) => toResult(token));
}

describe("MarkdownScanner", () => {
    test("comment", () => {
        const content = getTestFileContent("comments.md");
        const result = runScan(content);
        const expected: TokenResult[] = [
            { type: "html" },
            { type: "comment.id", id: "id" },
            { type: "comment.snippet", name: "section" }
        ];
        assert.deepStrictEqual(result, expected);
    });

    test("styling", () => {
        const content = getTestFileContent("styling.md");
        const result = runScan(content);
        const expected: TokenResult[] = [
            { type: "space" },
            {
                type: "paragraph",
                tokens: [
                    { type: "text", text: "plain " },
                    {
                        type: "strong",
                        tokens: [{ type: "text", text: "bold" }]
                    },
                    { type: "text", text: " " },
                    {
                        type: "em",
                        tokens: [{ type: "text", text: "italic" }]
                    },
                    { type: "text", text: " " },
                    {
                        type: "em",
                        tokens: [{
                            type: "strong",
                            tokens: [{ type: "text", text: "bold and italic" }]
                        }]
                    },
                    { type: "text", text: " " },
                    {
                        type: "del",
                        tokens: [{ type: "text", text: "strikethrough" }]
                    },
                    { type: "text", text: "\nnewline" }
                ]
            }
        ];
        assert.deepStrictEqual(result, expected);
    });

    test("images", () => {
        const content = getTestFileContent("images.md");
        const result = runScan(content);
        const expected: TokenResult[] = [{
            type: "paragraph",
            tokens: [
                { type: "image", text: "", href: "" },
                { type: "text", text: "\n" },
                { type: "image", text: "No link", href: "" },
                { type: "text", text: "\n" },
                { type: "image", text: "", href: "link" },
                { type: "text", text: "\n" },
                { type: "image", text: "Text and link", href: "link" }
            ]
        }];
        assert.deepStrictEqual(result, expected);
    });

    test("links", () => {
        const content = getTestFileContent("links.md");
        const result = runScan(content);
        const expected: TokenResult[] = [{
            type: "paragraph",
            tokens: [
                {
                    type: "link",
                    href: "",
                    tokens: []
                },
                { type: "text", text: "\n" },
                {
                    type: "link",
                    href: "",
                    tokens: [{ type: "text", text: "No link" }]
                },
                { type: "text", text: "\n" },
                {
                    type: "link",
                    href: "link",
                    tokens: []
                },
                { type: "text", text: "\n" },
                {
                    type: "link",
                    href: "link",
                    tokens: [{ type: "text", text: "Text and link" }]
                }
            ]
        }];
        assert.deepStrictEqual(result, expected);
    });

    test("headings", () => {
        const content = getTestFileContent("headings.md");
        const result = runScan(content);
        const expected: TokenResult[] = [
            {
                type: "heading",
                depth: 1,
                tokens: [{ type: "text", text: "Heading 1" }]
            },
            {
                type: "heading",
                depth: 2,
                tokens: [{ type: "text", text: "Heading 2" }]
            },
            {
                type: "heading",
                depth: 3,
                tokens: [{ type: "text", text: "Heading 3" }]
            },
            {
                type: "heading",
                depth: 4,
                tokens: [{ type: "text", text: "Heading 4" }]
            },
            {
                type: "heading",
                depth: 5,
                tokens: [{ type: "text", text: "Heading 5" }]
            },
            {
                type: "heading",
                depth: 6,
                tokens: [{ type: "text", text: "Heading 6" }]
            }
        ];
        assert.deepStrictEqual(result, expected);
    });

    test("quoted text", () => {
        const content = getTestFileContent("quoted-text.md");
        const result = runScan(content);
        const expected: TokenResult[] = [{
            type: "blockquote",
            tokens: [{
                type: "paragraph",
                tokens: [{ type: "text", text: "Quoted text" }]
            }]
        }];
        assert.deepStrictEqual(result, expected);
    });

    test("unordered-list", () => {
        const content = getTestFileContent("unordered-list.md");
        const result = runScan(content);
        const expected: TokenResult[] = [{
            type: "list",
            items: [
                {
                    type: "list_item",
                    tokens: [{
                        type: "text",
                        text: "Item 1",
                        tokens: [{ type: "text", text: "Item 1" }]
                    }]
                },
                {
                    type: "list_item",
                    tokens: [{
                        type: "text",
                        text: "Item 2",
                        tokens: [{ type: "text", text: "Item 2" }]
                    }]
                }
            ]
        }];
        assert.deepStrictEqual(result, expected);
    });

    test("ordered-list", () => {
        const content = getTestFileContent("ordered-list.md");
        const result = runScan(content);
        const expected: TokenResult[] = [{
            type: "list",
            items: [
                {
                    type: "list_item",
                    tokens: [{
                        type: "text",
                        text: "Item 1",
                        tokens: [{ type: "text", text: "Item 1" }]
                    }]
                },
                {
                    type: "list_item",
                    tokens: [{
                        type: "text",
                        text: "Item 2",
                        tokens: [{ type: "text", text: "Item 2" }]
                    }]
                }
            ]
        }];
        assert.deepStrictEqual(result, expected);
    });

    test("indented-list", () => {
        const content = getTestFileContent("indented-list.md");
        const result = runScan(content);
        const expected: TokenResult[] = [{
            type: "list",
            items: [
                {
                    type: "list_item",
                    tokens: [
                        {
                            type: "text",
                            text: "Item 1",
                            tokens: [{ type: "text", text: "Item 1" }]
                        },
                        {
                            type: "list",
                            items: [{
                                type: "list_item",
                                tokens: [{
                                    type: "text",
                                    text: "Item 1a",
                                    tokens: [{ type: "text", text: "Item 1a" }]
                                }]
                            }]
                        }
                    ]
                }
            ]
        }];
        assert.deepStrictEqual(result, expected);
    });

    test("task-list", () => {
        const content = getTestFileContent("task-list.md");
        const result = runScan(content);
        const expected: TokenResult[] = [{
            type: "list",
            items: [
                {
                    type: "list_item",
                    tokens: [{
                        type: "text",
                        text: "unchecked",
                        tokens: [{ type: "text", text: "unchecked" }]
                    }]
                },
                {
                    type: "list_item",
                    tokens: [{
                        type: "text",
                        text: "checked",
                        tokens: [{ type: "text", text: "checked" }]
                    }]
                }
            ]
        }];
        assert.deepStrictEqual(result, expected);
    });
});