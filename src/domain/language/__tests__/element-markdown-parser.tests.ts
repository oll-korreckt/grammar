import { assert } from "chai";
import { ElementMarkdownParser, Snippet } from "../element-markdown-parser";
import { getTestFileContent } from "./utils";

describe("ElementMarkdownParser", () => {
    describe("parsePage", () => {
        test("working example", () => {
            const content = getTestFileContent("parser.working_example.md");
            const result = ElementMarkdownParser.parsePage(content);
            assert.strictEqual(result.length, 3);
            const [headingLink, namedSnippet, unnamedSnippet] = result;
            assert.strictEqual(headingLink.containerType, "headingLink");
            assert.strictEqual(namedSnippet.containerType, "snippet");
            assert.strictEqual((namedSnippet as Snippet).name, "subject");
            assert.strictEqual(unnamedSnippet.containerType, "snippet");
            assert.isUndefined((unnamedSnippet as Snippet).name);
        });

        test("heading link error", () => {
            const content = getTestFileContent("parser.heading_link_error.md");
            assert.throws(
                () => ElementMarkdownParser.parsePage(content),
                /must precede headings/i
            );
        });

        test("snippets not equal", () => {
            const content = getTestFileContent("parser.snippets_not_equal.md");
            assert.throws(
                () => ElementMarkdownParser.parsePage(content),
                /snippets not equal/i
            );
        });

        test("unclosed snippet", () => {
            const content = getTestFileContent("parser.unclosed_snippet.md");
            assert.throws(
                () => ElementMarkdownParser.parsePage(content),
                /unclosed snippet/i
            );
        });
    });
});