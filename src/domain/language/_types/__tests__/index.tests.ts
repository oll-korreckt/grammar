import { assert } from "chai";
import { getElementDefinition } from "../index";
import { NounPhraseDefinition } from "../phrase";

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
        assert.deepEqual(result1, expected);
        const result2 = getElementDefinition("nounPhrase");
        assert.deepEqual(result2, result1);
        assert.notEqual(result2, result1);
    });
});