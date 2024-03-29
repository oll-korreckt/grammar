import TestRenderer, { ReactTestRendererJSON } from "react-test-renderer";
import { HTMLObjectRender } from "..";
import React from "react";
import { assert } from "chai";

type JSONElementType =
    | "blockquote"
    | "br"
    | "code"
    | "del"
    | "i"
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "img"
    | "hr"
    | "a"
    | "ol"
    | "ul"
    | "li"
    | "table"
    | "thead"
    | "tbody"
    | "tr"
    | "th"
    | "td"
    | "p"
    | "b"
    | "input"

interface TrimmedJSON {
    type: JSONElementType;
    props?: Record<string, any>;
    children?: TrimmedJSONOutput[];
}
type TrimmedJSONOutput = string | TrimmedJSON;

const allElements: { [Key in JSONElementType]: "" } = {
    blockquote: "",
    br: "",
    code: "",
    del: "",
    h1: "",
    h2: "",
    h3: "",
    h4: "",
    h5: "",
    h6: "",
    i: "",
    img: "",
    hr: "",
    a: "",
    ol: "",
    ul: "",
    li: "",
    table: "",
    thead: "",
    tbody: "",
    tr: "",
    th: "",
    td: "",
    p: "",
    b: "",
    input: ""
};

const validElementTypes = new Set(Object.keys(allElements));

function checkElementType(type: string): void {
    if (!validElementTypes.has(type)) {
        throw `Type '${type}' is not supported`;
    }
}

function trim(reactJson: ReactTestRendererJSON | string): TrimmedJSONOutput {
    if (typeof reactJson === "string") {
        return reactJson;
    }
    const { type, props, children } = reactJson;
    checkElementType(type);
    const output: TrimmedJSON = {
        type: type as JSONElementType
    };
    if (Object.keys(props).length > 0) {
        output.props = props;
    }
    if (children !== null) {
        output.children = children.map((child) => {
            return typeof child === "string"
                ? child
                : trim(child);
        });
    }
    return output;
}

type ArgType = Parameters<typeof TestRenderer.create>[0]

function render(content: ArgType): TrimmedJSONOutput | TrimmedJSONOutput[] {
    const output = TestRenderer.create(content).toJSON();
    if (output === null) {
        throw "invalid output type";
    }
    return Array.isArray(output)
        ? output.map((obj) => trim(obj))
        : trim(output);
}


describe("HTMLObjectRender", () => {
    test("text", () => {
        const result = render(
            <HTMLObjectRender>
                Here is some text
            </HTMLObjectRender>
        );
        assert.deepStrictEqual(result, "Here is some text");
    });

    test("plain elements", () => {
        const result = render(
            <HTMLObjectRender>
                {[
                    { type: "blockquote", content: "Here is a blockquote" },
                    { type: "code", content: "code" },
                    { type: "del", content: "strikethough" },
                    { type: "i", content: "some italic text" },
                    { type: "b", content: "some bold text too" },
                    { type: "h1", content: "heading 1" },
                    { type: "h2", content: "heading 2" },
                    { type: "h3", content: "heading 3" },
                    { type: "h4", content: "heading 4" },
                    { type: "h5", content: "heading 5" },
                    { type: "h6", content: "heading 6" },
                    { type: "p", content: "this is a paragraph" }
                ]}
            </HTMLObjectRender>
        );
        const expected: TrimmedJSON[] = [
            { type: "blockquote", children: ["Here is a blockquote"] },
            { type: "code", children: ["code"] },
            { type: "del", children: ["strikethough"] },
            { type: "i", children: ["some italic text"] },
            { type: "b", children: ["some bold text too"] },
            { type: "h1", children: ["heading 1"] },
            { type: "h2", children: ["heading 2"] },
            { type: "h3", children: ["heading 3"] },
            { type: "h4", children: ["heading 4"] },
            { type: "h5", children: ["heading 5"] },
            { type: "h6", children: ["heading 6"] },
            { type: "p", children: ["this is a paragraph"] }
        ];
        assert.deepStrictEqual(result, expected);
    });

    test("plain + content-less", () => {
        const result = render(
            <HTMLObjectRender>
                {[
                    { type: "br" },
                    { type: "hr" }
                ]}
            </HTMLObjectRender>
        );
        const expected: TrimmedJSON[] = [
            { type: "br" },
            { type: "hr" }
        ];
        assert.deepStrictEqual(result, expected);
    });

    test("override props", () => {
        const result = render(
            <HTMLObjectRender
                aProps={{ href: "Link2" }}
            >
                {{ type: "a", href: "Link1" }}
            </HTMLObjectRender>
        );
        const expected: TrimmedJSON = {
            type: "a",
            props: { href: "Link2" }
        };
        assert.deepStrictEqual(result, expected);
    });

    describe("className", () => {
        test("default", () => {
            const result = render(
                <HTMLObjectRender>
                    {[
                        {
                            type: "p",
                            className: "class1",
                            content: "String Class"
                        },
                        {
                            type: "p",
                            className: ["class1", "class2", "class3"],
                            content: "Array Class"
                        },
                        {
                            type: "p",
                            content: "No Class"
                        }
                    ]}
                </HTMLObjectRender>
            );
            const expected: TrimmedJSON[] = [
                {
                    type: "p",
                    props: { className: "class1" },
                    children: ["String Class"]
                },
                {
                    type: "p",
                    props: { className: "class1 class2 class3" },
                    children: ["Array Class"]
                },
                {
                    type: "p",
                    children: ["No Class"]
                }
            ];
            assert.deepStrictEqual(result, expected);
        });

        test("override", () => {
            const result = render(
                <HTMLObjectRender
                    classMap={() => "override"}
                >
                    {{
                        type: "p",
                        className: "class1",
                        content: "Override"
                    }}
                </HTMLObjectRender>
            );
            const expected: TrimmedJSON = {
                type: "p",
                props: { className: "override" },
                children: ["Override"]
            };
            assert.deepStrictEqual(result, expected);
        });
    });

    test("id", () => {
        const result = render(
            <HTMLObjectRender>
                {{
                    type: "blockquote",
                    id: "id1",
                    content: "This has an id"
                }}
            </HTMLObjectRender>
        );
        const expected: TrimmedJSON = {
            type: "blockquote",
            props: { id: "id1" },
            children: ["This has an id"]
        };
        assert.deepStrictEqual(result, expected);
    });

    test("mandatory props", () => {
        const result = render(
            <HTMLObjectRender
                checkboxProps={{ type: "not a checkbox" as any }}
            >
                {{ type: "checkbox" }}
            </HTMLObjectRender>
        );
        const expected: TrimmedJSON = {
            type: "input",
            props: { type: "checkbox" }
        };
        assert.deepStrictEqual(result, expected);
    });

    test("object", () => {
        const result = render(
            <HTMLObjectRender
                bProps={{ className: "bold-class" }}
            >
                {[
                    { type: "checkbox", checked: true },
                    { type: "b", content: "This is bold" }
                ]}
            </HTMLObjectRender>
        );
        const expected: TrimmedJSON[] = [
            {
                type: "input",
                props: { type: "checkbox", checked: true }
            },
            {
                type: "b",
                props: { className: "bold-class" },
                children: ["This is bold"]
            }
        ];
        assert.deepStrictEqual(result, expected);
    });

    test("functions", () => {
        const result = render(
            <HTMLObjectRender
                blockquoteProps={() => {
                    return { className: "hi" };
                }}
                h1Props={() => {
                    return { className: "hi" };
                }}
                iProps={() => {
                    return { className: "hi" };
                }}
            >
                {[
                    { type: "blockquote", content: "blockquote" },
                    { type: "h1", content: "heading 1" },
                    { type: "i", content: "italic" }
                ]}
            </HTMLObjectRender>
        );
        const expected: TrimmedJSON[] = [
            {
                type: "blockquote",
                props: { className: "hi" },
                children: ["blockquote"]
            },
            {
                type: "h1",
                props: { className: "hi" },
                children: ["heading 1"]
            },
            {
                type: "i",
                props: { className: "hi" },
                children: ["italic"]
            }
        ];
        assert.deepStrictEqual(result, expected);
    });

    test("tasklist", () => {
        const result = render(
            <HTMLObjectRender>
                {{
                    type: "tasklist",
                    items: [{
                        type: "li",
                        content: [
                            { type: "checkbox", checked: true },
                            "Some text"
                        ]
                    }]
                }}
            </HTMLObjectRender>
        );
        const expected: TrimmedJSON = {
            type: "ul",
            children: [{
                type: "li",
                children: [
                    { type: "input", props: { type: "checkbox", checked: true } },
                    "Some text"
                ]
            }]
        };
        assert.deepStrictEqual(result, expected);
    });

    test("anchor", () => {
        const result = render(
            <HTMLObjectRender>
                {{
                    type: "a",
                    href: "here is a link",
                    content: "here is content"
                }}
            </HTMLObjectRender>
        );
        const expected: TrimmedJSON = {
            type: "a",
            props: { href: "here is a link" },
            children: ["here is content"]
        };
        assert.deepStrictEqual(result, expected);
    });

    test("img", () => {
        const result = render(
            <HTMLObjectRender>
                {{
                    type: "img",
                    src: "here is the source",
                    alt: "here is the alt"
                }}
            </HTMLObjectRender>
        );
        const expected: TrimmedJSON = {
            type: "img",
            props: {
                src: "here is the source",
                alt: "here is the alt"
            }
        };
        assert.deepStrictEqual(result, expected);
    });

    test("table", () => {
        const result = render(
            <HTMLObjectRender>
                {{
                    type: "table",
                    head: {
                        type: "thead",
                        content: {
                            type: "tr",
                            cells: [
                                {
                                    type: "th",
                                    align: "left",
                                    content: "Column 1"
                                },
                                {
                                    type: "th",
                                    content: "Column 2"
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
                                        content: "11"
                                    },
                                    {
                                        type: "td",
                                        content: "12"
                                    }
                                ]
                            },
                            {
                                type: "tr",
                                cells: [
                                    {
                                        type: "td",
                                        content: "21"
                                    },
                                    {
                                        type: "td",
                                        content: "22"
                                    }
                                ]
                            }
                        ]
                    }
                }}
            </HTMLObjectRender>
        );
        const expected: TrimmedJSON = {
            type: "table",
            children: [
                {
                    type: "thead",
                    children: [{
                        type: "tr",
                        children: [
                            { type: "th", props: { align: "left" }, children: ["Column 1"] },
                            { type: "th", children: ["Column 2"] }
                        ]
                    }]
                },
                {
                    type: "tbody",
                    children: [
                        {
                            type: "tr",
                            children: [
                                { type: "td", children: ["11"] },
                                { type: "td", children: ["12"] }
                            ]
                        },
                        {
                            type: "tr",
                            children: [
                                { type: "td", children: ["21"] },
                                { type: "td", children: ["22"] }
                            ]
                        }
                    ]
                }
            ]
        };
        assert.deepStrictEqual(result, expected);
    });
});