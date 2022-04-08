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
    const output = MarkdownCompiler.compile(containers);
    return output;
}

describe("MarkdownCompiler", () => {
    test("styling", () => {
        const result = toCompilerResult("styling.md");
        const expected: HTMLObject = {
            type: "p",
            custom: "customVal",
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
            head: {
                type: "thead",
                content: {
                    type: "tr",
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
                }
            },
            body: {
                type: "tbody",
                content: [
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
            }
        };
        assert.deepStrictEqual(result, expected);
    });

    test("ids and classes", () => {
        const result = toCompilerResult("custom-ids-classes.md");
        const expected: HTMLObject[] = [
            {
                type: "h1",
                custom: "thisIsCustom",
                id: "id1",
                className: ["class1", "class2", "class3"],
                content: "This is a header"
            },
            {
                type: "p",
                className: "class1",
                content: "No id"
            },
            {
                type: "h3",
                custom: "customVal",
                id: "id2",
                content: "No class(es)"
            },
            {
                type: "blockquote",
                custom: "customVal",
                className: "class1",
                content: { type: "p", content: "Class and custom" }
            }
        ];
        assert.deepStrictEqual(result, expected);
    });
});