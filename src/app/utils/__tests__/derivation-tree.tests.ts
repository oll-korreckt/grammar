import { ElementType } from "@domain/language";
import { assert } from "chai";
import { DerivationTree } from "../derivation-tree";

describe("DerivationTree", () => {
    describe("getElements", () => {
        test("no coordinator", () => {
            const input: ElementType[] = [
                "noun",
                "verb"
            ];
            const result = DerivationTree.getElements(input);
            const expected: ElementType[] = [
                "nounPhrase",
                "verbPhrase",
                "independentClause"
            ];
            assert.deepStrictEqual(result.sort(), expected.sort());
        });

        test("coordinator", () => {
            const input: ElementType[] = ["coordinator"];
            const result = DerivationTree.getElements(input);
            const expected: ElementType[] = [];
            assert.deepStrictEqual(result, expected);
        });

        test("word", () => {
            const result = DerivationTree.getElements(["word"]);
            const expected: ElementType[] = [
                "noun",
                "pronoun",
                "verb",
                "infinitive",
                "participle",
                "gerund",
                "adjective",
                "adverb",
                "preposition",
                "determiner",
                "coordinator",
                "subordinator",
                "interjection"
            ];
            assert.deepStrictEqual(result.sort(), expected.sort());
        });
    });
});