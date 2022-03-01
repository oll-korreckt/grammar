import { assert } from "chai";
import { HTMLObject, HTMLTableObject } from "..";
import { MarkdownCompiler } from "../markdown-compiler";
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
            type: "p",
            content: [
                "plain ",
                { type: "b", content: "bold" },
                " ",
                { type: "i", content: "italic" },
                " ",
                {
                    type: "i",
                    content: { type: "b", content: "bold and italic" }
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
            type: "p",
            content: {
                type: "img",
                src: "link",
                alt: "Text and link"
            }
        };
        assert.deepStrictEqual(result, expected);
    });

    test("link", () => {
        const result = toCompilerResult("link.md");
        const expected: HTMLObject = {
            type: "p",
            content: {
                type: "a",
                href: "link",
                content: [
                    "Text ",
                    { type: "b", content: "and" },
                    " ",
                    { type: "i", content: "link" }
                ]
            }
        };
        assert.deepStrictEqual(result, expected);
    });

    test("ordered list", () => {
        const result = toCompilerResult("ordered-list.md");
        const expected: HTMLObject = {
            type: "ol",
            items: [
                {
                    type: "li",
                    content: "Item 1"
                },
                {
                    type: "li",
                    content: "Item 2"
                }
            ]
        };
        assert.deepStrictEqual(result, expected);
    });

    test("unordered list", () => {
        const result = toCompilerResult("unordered-list.md");
        const expected: HTMLObject = {
            type: "ul",
            items: [
                { type: "li", content: "Item 1" },
                { type: "li", content: "Item 2" }
            ]
        };
        assert.deepStrictEqual(result, expected);
    });

    test("task list", () => {
        const result = toCompilerResult("task-list.md");
        const expected: HTMLObject = {
            type: "tasklist",
            items: [
                {
                    type: "li",
                    content: [
                        { type: "checkbox" },
                        "unchecked"
                    ]
                },
                {
                    type: "li",
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
            type: "ol",
            items: [
                {
                    type: "li",
                    content: [
                        "Item 1 ",
                        { type: "i", content: "and" },
                        " ",
                        { type: "b", content: "stylized" },
                        " ",
                        { type: "del", content: "stuff" },
                        {
                            type: "ul",
                            items: [{ type: "li", content: "Item 1a" }]
                        }
                    ]
                },
                { type: "li", content: "Item 2" },
                {
                    type: "li",
                    content: [
                        "Item 3",
                        {
                            type: "ol",
                            items: [
                                { type: "li", content: "Item 3a" },
                                {
                                    type: "li",
                                    content: [
                                        "Item 3b",
                                        {
                                            type: "ul",
                                            items: [
                                                { type: "li", content: "Item 3b1" },
                                                { type: "li", content: "Item 3b2" }
                                            ]
                                        }
                                    ]
                                },
                                { type: "li", content: "Item 3c" }
                            ]
                        }
                    ]
                },
                { type: "li", content: "Item 4" }
            ]
        };
        assert.deepStrictEqual(result, expected);
    });

    test("table", () => {
        const result = toCompilerResult("table.md");
        const expected: HTMLTableObject = {
            type: "table",
            headers: {
                type: "tr",
                header: true,
                cells: [
                    {
                        type: "th",
                        content: [
                            { type: "i", content: "No" },
                            " ",
                            { type: "b", content: "align" }
                        ]
                    },
                    { type: "th", align: "left", content: "Align Left" },
                    {
                        type: "th",
                        align: "right",
                        content: { type: "b", content: "Align Right" }
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
                            content: { type: "b", content: "bold" }
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
                            content: { type: "i", content: "italic" }
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