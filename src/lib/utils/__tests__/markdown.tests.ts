import { assert } from "chai";
import { Markdown, MarkdownToken } from "../markdown";

describe("markdown", () => {
    describe("toTokens", () => {
        test("paragraph", () => {
            const input = "what *does* ***this*** do?";
            const result = Markdown.toTokens(input);
            const expected: MarkdownToken[] = [{
                type: "paragraph",
                tokens: [
                    { type: "text", content: "what " },
                    {
                        type: "italic",
                        tokens: [{ type: "text", content: "does" }]
                    },
                    { type: "text", content: " " },
                    {
                        type: "italic",
                        tokens: [{
                            type: "bold",
                            tokens: [{ type: "text", content: "this" }]
                        }]
                    },
                    { type: "text", content: " do?" }
                ]
            }];
            assert.deepStrictEqual(result, expected);
        });
    });
});