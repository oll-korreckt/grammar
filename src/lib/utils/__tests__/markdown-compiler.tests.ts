import { assert } from "chai";
import { HTMLObject, MarkdownCompiler } from "../markdown-compiler";
import { MarkdownParser } from "../markdown-parser";
import { MarkdownScanner } from "../markdown-scanner";
import { getTestFileContent } from "./utils";

function toCompilerResult(filename: string): HTMLObject | HTMLObject[] {
    const content = getTestFileContent(filename);
    const tokens = MarkdownScanner.scan(content);
    const containers = MarkdownParser.parse(tokens);
    return MarkdownCompiler.compile(containers);
}

describe("MarkdownCompiler", () => {
    test("styling", () => {
        const result = toCompilerResult("styling.md");
        const expected: HTMLObject = {
            type: "paragraph",
            content: [
                "plain ",
                { type: "bold", content: "bold" },
                " ",
                { type: "italic", content: "italic" },
                " ",
                {
                    type: "italic",
                    content: { type: "bold", content: "bold and italic" }
                },
                " ",
                { type: "del", content: "strikethrough" },
                { type: "br" },
                "newline"
            ]
        };
        assert.deepStrictEqual(result, expected);
    });

    test("image", () => {
        const result = toCompilerResult("image.md");
        const expected: HTMLObject = {
            type: "paragraph",
            content: {
                type: "image",
                src: "link",
                alt: "Text and link"
            }
        };
        assert.deepStrictEqual(result, expected);
    });

    test("link", () => {
        const result = toCompilerResult("link.md");
        const expected: HTMLObject = {
            type: "paragraph",
            content: {
                type: "link",
                href: "link",
                content: [
                    "Text ",
                    { type: "bold", content: "and" },
                    " ",
                    { type: "italic", content: "link" }
                ]
            }
        };
        assert.deepStrictEqual(result, expected);
    });

    test("ordered list", () => {
        const result = toCompilerResult("ordered-list.md");
        const expected: HTMLObject = {
            type: "ordered_list",
            items: [
                {
                    type: "list_item",
                    content: "Item 1"
                },
                {
                    type: "list_item",
                    content: "Item 2"
                }
            ]
        };
        assert.deepStrictEqual(result, expected);
    });

    test("unordered list", () => {
        const result = toCompilerResult("unordered-list.md");
        const expected: HTMLObject = {
            type: "unordered_list",
            items: [
                { type: "list_item", content: "Item 1" },
                { type: "list_item", content: "Item 2" }
            ]
        };
        assert.deepStrictEqual(result, expected);
    });

    test("task list", () => {
        const result = toCompilerResult("task-list.md");
        const expected: HTMLObject = {
            type: "task_list",
            items: [
                {
                    type: "list_item",
                    content: [
                        { type: "checkbox" },
                        "unchecked"
                    ]
                },
                {
                    type: "list_item",
                    content: [
                        { type: "checkbox", checked: true },
                        "checked"
                    ]
                }
            ]
        };
        assert.deepStrictEqual(result, expected);
    });

    test("indented list", () => {
        const result = toCompilerResult("indented-list.md");
        const expected: HTMLObject = {
            type: "ordered_list",
            items: [
                {
                    type: "list_item",
                    content: [
                        "Item 1 ",
                        { type: "italic", content: "and" },
                        " ",
                        { type: "bold", content: "stylized" },
                        " ",
                        { type: "del", content: "stuff" },
                        {
                            type: "unordered_list",
                            items: [{ type: "list_item", content: "Item 1a" }]
                        }
                    ]
                },
                { type: "list_item", content: "Item 2" },
                {
                    type: "list_item",
                    content: [
                        "Item 3",
                        {
                            type: "ordered_list",
                            items: [
                                { type: "list_item", content: "Item 3a" },
                                {
                                    type: "list_item",
                                    content: [
                                        "Item 3b",
                                        {
                                            type: "unordered_list",
                                            items: [
                                                { type: "list_item", content: "Item 3b1" },
                                                { type: "list_item", content: "Item 3b2" }
                                            ]
                                        }
                                    ]
                                },
                                { type: "list_item", content: "Item 3c" }
                            ]
                        }
                    ]
                },
                { type: "list_item", content: "Item 4" }
            ]
        };
        assert.deepStrictEqual(result, expected);
    });
});