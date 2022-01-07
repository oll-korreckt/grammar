import { assert } from "chai";
import { ConsolidatedLabel, Utils, LabelData } from "../utils";

const space: LabelData = { type: "whitespace", lexeme: " " };

describe("Utils", () => {
    describe("scan", () => {
        test("adjacent diff ids", () => {
            const input: LabelData[] = [
                { type: "element", id: "1", elementType: "word", lexeme: "moo" },
                space,
                { type: "element", id: "2", elementType: "word", lexeme: "cow" }
            ];
            const result = Utils.scan(input);
            const expected: ConsolidatedLabel[] = [
                {
                    type: "element",
                    id: "1",
                    elementType: "word",
                    lexemes: { type: "element", lexeme: "moo" }
                },
                {
                    type: "whitespace",
                    lexeme: " "
                },
                {
                    type: "element",
                    id: "2",
                    elementType: "word",
                    lexemes: { type: "element", lexeme: "cow" }
                }
            ];
            assert.deepStrictEqual(result, expected);
        });

        test("adjacent same ids", () => {
            const input: LabelData[] = [
                { type: "element", id: "1", elementType: "adjective", lexeme: "happy" },
                space,
                { type: "element", id: "1", elementType: "adjective", lexeme: "big" },
                space,
                { type: "element", id: "1", elementType: "adjective", lexeme: "red" },
                space,
                { type: "element", id: "2", elementType: "noun", lexeme: "dog" }
            ];
            const result = Utils.scan(input);
            const expected: ConsolidatedLabel[] = [
                {
                    type: "element",
                    id: "1",
                    elementType: "adjective",
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
                    elementType: "noun",
                    lexemes: { type: "element", lexeme: "dog" }
                }
            ];
            assert.deepStrictEqual(result, expected);
        });

        test("diff between same", () => {
            const input: LabelData[] = [
                { type: "element", id: "1", elementType: "verb", lexeme: "to" },
                space,
                { type: "element", id: "2", elementType: "adverb", lexeme: "boldly" },
                space,
                { type: "element", id: "1", elementType: "verb", lexeme: "go" }
            ];
            const result = Utils.scan(input);
            const expected: ConsolidatedLabel[] = [
                {
                    type: "element",
                    id: "1",
                    elementType: "verb",
                    lexemes: { type: "element", lexeme: "to" }
                },
                {
                    type: "whitespace",
                    lexeme: " "
                },
                {
                    type: "element",
                    id: "2",
                    elementType: "adverb",
                    lexemes: { type: "element", lexeme: "boldly" }
                },
                {
                    type: "whitespace",
                    lexeme: " "
                },
                {
                    type: "element",
                    id: "1",
                    elementType: "verb",
                    lexemes: { type: "element", lexeme: "go" }
                }
            ];
            assert.deepStrictEqual(result, expected);
        });
    });
});