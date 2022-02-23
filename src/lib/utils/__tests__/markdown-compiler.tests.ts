import { assert } from "chai";
import { HTMLObject, HTMLTableObject, MarkdownCompiler } from "../markdown-compiler";
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

    test("table", () => {
        const result = toCompilerResult("table.md");
        const expected: HTMLTableObject = {
            type: "table",
            headers: {
                type: "header_row",
                cells: [
                    {
                        type: "th",
                        content: [
                            { type: "italic", content: "No" },
                            " ",
                            { type: "bold", content: "align" }
                        ]
                    },
                    { type: "th", align: "left", content: "Align Left" },
                    {
                        type: "th",
                        align: "right",
                        content: { type: "bold", content: "Align Right" }
                    },
                    {
                        type: "th",
                        align: "center",
                        content: { type: "del", content: "Align Center" }
                    }
                ]
            },
            rows: [
                {
                    type: "tr",
                    cells: [
                        {
                            type: "td",
                            content: { type: "bold", content: "bold" }
                        },
                        { type: "td", content: "12" },
                        { type: "td", content: "13" },
                        { type: "td", content: "14" }
                    ]
                },
                {
                    type: "tr",
                    cells: [
                        { type: "td", content: "21" },
                        {
                            type: "td",
                            content: { type: "italic", content: "italic" }
                        },
                        { type: "td", content: "23" },
                        { type: "td", content: "24" }
                    ]
                },
                {
                    type: "tr",
                    cells: [
                        { type: "td", content: "31" },
                        { type: "td", content: "32" },
                        { type: "td", content: "33" },
                        { type: "td", content: "34" }
                    ]
                }
            ]
        };
        assert.deepStrictEqual(result, expected);
    });
});