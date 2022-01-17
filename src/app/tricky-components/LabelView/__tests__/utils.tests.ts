import { WhitespaceLexeme } from "@app/utils";
import { assert } from "chai";
import { Lexeme, Utils, ConsolidatedElementLexeme } from "../utils";

const space: Lexeme = { type: "whitespace", lexeme: " " };

describe("Utils", () => {
    describe("scan", () => {
        test("adjacent diff ids", () => {
            const input: Lexeme[] = [
                { type: "element", id: "1", lexeme: "moo" },
                space,
                { type: "element", id: "2", lexeme: "cow" }
            ];
            const result = Utils.scan(input);
            const expected: (ConsolidatedElementLexeme | WhitespaceLexeme)[] = [
                {
                    type: "element",
                    id: "1",
                    lexemes: [{ type: "element", lexeme: "moo" }]
                },
                {
                    type: "whitespace",
                    lexeme: " "
                },
                {
                    type: "element",
                    id: "2",
                    lexemes: [{ type: "element", lexeme: "cow" }]
                }
            ];
            assert.deepStrictEqual(result, expected);
        });

        test("adjacent same ids", () => {
            const input: Lexeme[] = [
                { type: "element", id: "1", lexeme: "happy" },
                space,
                { type: "element", id: "1", lexeme: "big" },
                space,
                { type: "element", id: "1", lexeme: "red" },
                space,
                { type: "element", id: "2", lexeme: "dog" }
            ];
            const result = Utils.scan(input);
            const expected: (ConsolidatedElementLexeme | WhitespaceLexeme)[] = [
                {
                    type: "element",
                    id: "1",
                    lexemes: [
                        { type: "element", lexeme: "happy" },
                        space,
                        { type: "element", lexeme: "big" },
                        space,
                        { type: "element", lexeme: "red" }
                    ]
                },
                {
                    type: "whitespace",
                    lexeme: " "
                },
                {
                    type: "element",
                    id: "2",
                    lexemes: [{ type: "element", lexeme: "dog" }]
                }
            ];
            assert.deepStrictEqual(result, expected);
        });

        test("diff between same", () => {
            const input: Lexeme[] = [
                { type: "element", id: "1", lexeme: "to" },
                space,
                { type: "element", id: "2", lexeme: "boldly" },
                space,
                { type: "element", id: "1", lexeme: "go" }
            ];
            const result = Utils.scan(input);
            const expected: (ConsolidatedElementLexeme | WhitespaceLexeme)[] = [
                {
                    type: "element",
                    id: "1",
                    lexemes: [{ type: "element", lexeme: "to" }]
                },
                {
                    type: "whitespace",
                    lexeme: " "
                },
                {
                    type: "element",
                    id: "2",
                    lexemes: [{ type: "element", lexeme: "boldly" }]
                },
                {
                    type: "whitespace",
                    lexeme: " "
                },
                {
                    type: "element",
                    id: "1",
                    lexemes: [{ type: "element", lexeme: "go" }]
                }
            ];
            assert.deepStrictEqual(result, expected);
        });
    });
});