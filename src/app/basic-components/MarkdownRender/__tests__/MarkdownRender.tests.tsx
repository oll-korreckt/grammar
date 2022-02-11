import { Markdown } from "@lib/utils/markdown";
import { render } from "@testing-library/react";
import { assert } from "chai";
import React from "react";
import { MarkdownRender } from "..";

function createTestIdProps(testId: string): any {
    return { "data-testid": testId } as any;
}

function createTestIdFunc(testId: string): () => any {
    return () => createTestIdProps(testId);
}

function joinStrings(...strings: string[]): string {
    let output = "";
    strings.forEach((value, index) => {
        if (index > 0) {
            output += "\n";
        }
        output += value;
    });
    return output;
}

describe("MarkdownRender", () => {
    describe("tag types", () => {
        function runTest(markdown: string, expectedTag: string, unwrap?: boolean): void {
            let [token] = Markdown.toTokens(markdown);
            if (unwrap) {
                if (token.type !== "paragraph") {
                    throw "supposed to be paragraph";
                }
                [token] = token.tokens;
            }
            const result = render(
                <div data-testid="container">
                    <MarkdownRender>
                        {token}
                    </MarkdownRender>
                </div>
            ).getByTestId("container").firstElementChild;
            if (result === null) {
                throw "no children rendered";
            }
            assert.strictEqual(result.tagName, expectedTag);
        }

        test("paragraph", () => {
            runTest("paragraph", "P");
        });
        test("italic", () => {
            runTest("*italic*", "I", true);
        });
        test("bold", () => {
            runTest("**bold**", "B", true);
        });
        test("h1", () => {
            runTest("# header", "H1");
        });
        test("h2", () => {
            runTest("## header", "H2");
        });
        test("h3", () => {
            runTest("### header", "H3");
        });
        test("h4", () => {
            runTest("#### header", "H4");
        });
        test("h5", () => {
            runTest("##### header", "H5");
        });
        test("h6", () => {
            runTest("###### header", "H6");
        });
    });

    describe("props", () => {
        const tokens = Markdown.toTokens(joinStrings(
            "raw paragraph",
            "",
            "*italic*",
            "",
            "**bold**",
            "# h1",
            "## h2",
            "### h3",
            "#### h4",
            "##### h5",
            "###### h6"
        ));

        test("object", () => {
            const result = render(
                <MarkdownRender
                    paragraphProps={createTestIdProps("p")}
                    italicProps={createTestIdProps("i")}
                    headingProps={createTestIdProps("h")}
                    anchorProps={createTestIdProps("a")}
                    boldProps={createTestIdProps("b")}
                >
                    {tokens}
                </MarkdownRender>
            );
            const paragraphs = result.getAllByTestId("p");
            assert.strictEqual(paragraphs.length, 3);
            const rawParagraph = paragraphs[0];
            assert.strictEqual(rawParagraph.textContent, "raw paragraph");
            assert.strictEqual(
                result.getByTestId("i").textContent,
                "italic"
            );
            assert.strictEqual(
                result.getByTestId("b").textContent,
                "bold"
            );
            const headers = result.getAllByTestId("h");
            const [h1, h2, h3, h4, h5, h6] = headers;
            assert.strictEqual(h1.textContent, "h1");
            assert.strictEqual(h2.textContent, "h2");
            assert.strictEqual(h3.textContent, "h3");
            assert.strictEqual(h4.textContent, "h4");
            assert.strictEqual(h5.textContent, "h5");
            assert.strictEqual(h6.textContent, "h6");
        });

        test("function", () => {
            const result = render(
                <MarkdownRender
                    paragraphProps={createTestIdFunc("p")}
                    italicProps={createTestIdFunc("i")}
                    headingProps={createTestIdFunc("h")}
                    anchorProps={createTestIdFunc("a")}
                    boldProps={createTestIdFunc("b")}
                >
                    {tokens}
                </MarkdownRender>
            );
            const paragraphs = result.getAllByTestId("p");
            assert.strictEqual(paragraphs.length, 3);
            const rawParagraph = paragraphs[0];
            assert.strictEqual(rawParagraph.textContent, "raw paragraph");
            assert.strictEqual(
                result.getByTestId("i").textContent,
                "italic"
            );
            assert.strictEqual(
                result.getByTestId("b").textContent,
                "bold"
            );
            const headers = result.getAllByTestId("h");
            const [h1, h2, h3, h4, h5, h6] = headers;
            assert.strictEqual(h1.textContent, "h1");
            assert.strictEqual(h2.textContent, "h2");
            assert.strictEqual(h3.textContent, "h3");
            assert.strictEqual(h4.textContent, "h4");
            assert.strictEqual(h5.textContent, "h5");
            assert.strictEqual(h6.textContent, "h6");
        });
    });
});