import { assert } from "chai";
import { ElementCategory, getElementDefinition } from "../index";
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

    describe("ElementCategory", () => {
        test("getLayerFilter", () => {
            function _runTest(category: ElementCategory, trueCategories: ElementCategory[], falseCategories: ElementCategory[]): void {
                const filterFn = ElementCategory.getLayerFilter(category);
                trueCategories.forEach((cat) => {
                    const result = filterFn(cat);
                    assert.isTrue(result);
                });
                falseCategories.forEach((cat) => {
                    const result = filterFn(cat);
                    assert.isFalse(result);
                });
            }

            _runTest(
                "word",
                ["word"],
                ["partOfSpeech", "phrase", "clause"]
            );
            _runTest(
                "partOfSpeech",
                ["word", "partOfSpeech"],
                ["phrase", "clause"]
            );
            _runTest(
                "phrase",
                ["word", "partOfSpeech", "phrase"],
                ["clause"]
            );
            _runTest(
                "clause",
                ["word", "partOfSpeech", "phrase", "clause"],
                []
            );
        });

        describe("getElementCategory", () => {
            test("standard", () => {
                assert.strictEqual(
                    ElementCategory.getElementCategory("word"),
                    "word"
                );
                assert.strictEqual(
                    ElementCategory.getElementCategory("adjective"),
                    "partOfSpeech"
                );
                assert.strictEqual(
                    ElementCategory.getElementCategory("coordinatedParticiplePhrase"),
                    "phrase"
                );
                assert.strictEqual(
                    ElementCategory.getElementCategory("coordinatedRelativeClause"),
                    "clause"
                );
            });

            test("error", () => {
                assert.throw(
                    () => ElementCategory.getElementCategory("what" as ElementType),
                    /unhandled type/i
                );
            });
        });
    });
});