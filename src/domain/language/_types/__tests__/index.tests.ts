import { assert } from "chai";
import { getElementCategory, getElementDefinition } from "../index";
import { NounPhraseDefinition } from "../phrase";
import { ElementType } from "../utils";

describe("index", () => {
    test("getElementDefinition", () => {
        const expected: NounPhraseDefinition = {
            head: [false, ["noun", "pronoun", "coordinatedNounPhrase"]],
            modifiers: [
                true,
                [
                    "determiner",
                    "coordinatedDeterminer",
                    "adjective",
                    "coordinatedAdjective",
                    "adjectivePhrase",
                    "coordinatedAdjectivePhrase",
                    "preposition",
                    "coordinatedPreposition",
                    "prepositionPhrase",
                    "coordinatedPrepositionPhrase",
                    "relativeClause",
                    "coordinatedRelativeClause",
                    "participle",
                    "coordinatedParticiple",
                    "participlePhrase",
                    "coordinatedParticiplePhrase",
                    "infinitive",
                    "coordinatedInfinitive",
                    "infinitivePhrase",
                    "coordinatedInfinitivePhrase"
                ]
            ]
        };
        const result1 = getElementDefinition("nounPhrase");
        assert.deepEqual(
            result1,
            expected as unknown as Record<string, [boolean, ElementType[]]>
        );
        const result2 = getElementDefinition("nounPhrase");
        assert.deepEqual(result2, result1);
        assert.notEqual(result2, result1);
    });

    describe("getElementCategory", () => {
        test("standard", () => {
            assert.strictEqual(
                getElementCategory("word"),
                "word"
            );
            assert.strictEqual(
                getElementCategory("adjective"),
                "partOfSpeech"
            );
            assert.strictEqual(
                getElementCategory("coordinatedParticiplePhrase"),
                "phrase"
            );
            assert.strictEqual(
                getElementCategory("coordinatedRelativeClause"),
                "clause"
            );
        });

        test("error", () => {
            assert.throw(
                () => getElementCategory("what" as ElementType),
                /unhandled type/i
            );
        });
    });
});