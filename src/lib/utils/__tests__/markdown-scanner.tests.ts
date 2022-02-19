import { assert } from "chai";
import { MarkdownScanner } from "../markdown-scanner";
import { getTestFileContent, TokenResult, toResult } from "./utils";


function runScan(content: string): TokenResult[] {
    return MarkdownScanner.scan(content).map((token) => toResult(token));
}

function runFileScan(filename: string): TokenResult[] {
    const content = getTestFileContent(filename);
    return runScan(content);
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
                    { type: "br" },
                    { type: "text", text: "newline" }
                ]
            }
        ];
        assert.deepStrictEqual(result, expected);
    });

    describe("images", () => {
        test("success", () => {
            const result = runFileScan("image.md");
            const expected: TokenResult[] = [{
                type: "paragraph",
                tokens: [{
                    type: "image",
                    text: "Text and link",
                    href: "link"
                }]
            }];
            assert.deepStrictEqual(result, expected);
        });

        test("no href", () => {
            assert.throws(
                () => runFileScan("image-no-href.md"),
                /non-empty \'href\'/i
            );
        });

        test("no text", () => {
            assert.throws(
                () => runFileScan("image-no-text.md"),
                /non-empty \'text\'/i
            );
        });
    });

    describe("links", () => {
        test("success", () => {
            const content = getTestFileContent("link.md");
            const result = runScan(content);
            const expected: TokenResult[] = [{
                type: "paragraph",
                tokens: [
                    {
                        type: "link",
                        href: "link",
                        tokens: [{ type: "text", text: "Text and link" }]
                    }
                ]
            }];
            assert.deepStrictEqual(result, expected);
        });

        test("no href", () => {
            assert.throws(
                () => runFileScan("link-no-href.md"),
                /non-empty \'href\'/i
            );
        });

        test("no text", () => {
            assert.throws(
                () => runFileScan("link-no-text.md"),
                /non-empty \'text\'/i
            );
        });
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

    test("invalid newline", () => {
        assert.throws(
            () => runFileScan("invalid-newline.md"),
            /token contains invalid newline character/i
        );
    });
});