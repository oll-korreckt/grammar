import { createState, Ids } from "@app/testing";
import { DisplayModel, ElementData } from "@app/utils";
import { assert } from "chai";
import { getElementData } from "../WordView";

type NoKey = Omit<ElementData, "key">;

describe("WordView", () => {
    describe("getElementData", () => {
        test("partOfSpeech", () => {
            const diagram = createState();
            const model = DisplayModel.init(diagram);
            const result: NoKey[] = getElementData(
                diagram,
                model,
                "partOfSpeech",
                undefined
            ).map(({ key, ...rest }) => rest);
            const expected: NoKey[] = [
                {
                    head: true,
                    id: Ids.the1Det,
                    type: "determiner",
                    lexemes: ["The"],
                    selected: false,
                    index: 0
                },
                {
                    head: true,
                    id: Ids.quickBrownAdj,
                    type: "adjective",
                    lexemes: ["quick", "brown"],
                    selected: false,
                    index: [1, 2]
                },
                {
                    head: true,
                    id: Ids.foxNoun,
                    type: "noun",
                    lexemes: ["fox"],
                    selected: false,
                    index: 3
                },
                {
                    head: true,
                    id: Ids.jumpsVerb,
                    type: "verb",
                    lexemes: ["jumps"],
                    selected: false,
                    index: 4
                },
                {
                    head: true,
                    id: Ids.overPrep,
                    type: "preposition",
                    lexemes: ["over"],
                    selected: false,
                    index: 5
                },
                {
                    head: true,
                    id: Ids.the2Det,
                    type: "determiner",
                    lexemes: ["the"],
                    selected: false,
                    index: 6
                },
                {
                    head: true,
                    id: Ids.lazyAdj,
                    type: "adjective",
                    lexemes: ["lazy"],
                    selected: false,
                    index: 7
                },
                {
                    head: true,
                    id: Ids.dogNoun,
                    type: "noun",
                    lexemes: ["dog"],
                    selected: false,
                    index: 8
                }
            ];
            assert.deepStrictEqual(result, expected);
        });

        test("partOfSpeech - selected", () => {
            const diagram = createState();
            const model = DisplayModel.init(diagram);
            const result: NoKey[] = getElementData(
                diagram,
                model,
                "partOfSpeech",
                [{
                    id: Ids.quickBrownAdj,
                    type: "adjective",
                    state: "expand"
                }]
            ).map(({ key, ...rest }) => rest);
            const expected: NoKey[] = [
                {
                    head: true,
                    id: Ids.the1Det,
                    type: "determiner",
                    lexemes: ["The"],
                    selected: false,
                    index: 0
                },
                {
                    head: true,
                    id: Ids.quick,
                    type: "word",
                    lexemes: ["quick"],
                    selected: false,
                    index: 1
                },
                {
                    head: true,
                    id: Ids.brown,
                    type: "word",
                    lexemes: ["brown"],
                    selected: false,
                    index: 2
                },
                {
                    head: true,
                    id: Ids.foxNoun,
                    type: "noun",
                    lexemes: ["fox"],
                    selected: false,
                    index: 3
                },
                {
                    head: true,
                    id: Ids.jumpsVerb,
                    type: "verb",
                    lexemes: ["jumps"],
                    selected: false,
                    index: 4
                },
                {
                    head: true,
                    id: Ids.overPrep,
                    type: "preposition",
                    lexemes: ["over"],
                    selected: false,
                    index: 5
                },
                {
                    head: true,
                    id: Ids.the2Det,
                    type: "determiner",
                    lexemes: ["the"],
                    selected: false,
                    index: 6
                },
                {
                    head: true,
                    id: Ids.lazyAdj,
                    type: "adjective",
                    lexemes: ["lazy"],
                    selected: false,
                    index: 7
                },
                {
                    head: true,
                    id: Ids.dogNoun,
                    type: "noun",
                    lexemes: ["dog"],
                    selected: false,
                    index: 8
                }
            ];
            assert.deepStrictEqual(result, expected);
        });

        test("phraseAndClause", () => {
            const diagram = createState();
            const model = DisplayModel.init(diagram);
            const result: NoKey[] = getElementData(
                diagram,
                model,
                "phraseAndClause",
                undefined
            ).map(({ key, ...rest }) => rest);
            const expected: NoKey[] = [{
                id: Ids.indClause,
                head: true,
                type: "independentClause",
                lexemes: [
                    "The",
                    "quick",
                    "brown",
                    "fox",
                    "jumps",
                    "over",
                    "the",
                    "lazy",
                    "dog"
                ],
                selected: false,
                index: [0, 8]
            }];
            assert.deepStrictEqual(result, expected);
        });

        test("phraseAndClause - selected", () => {
            const diagram = createState();
            const model = DisplayModel.init(diagram);
            const result: NoKey[] = getElementData(
                diagram,
                model,
                "phraseAndClause",
                [
                    {
                        id: Ids.indClause,
                        type: "independentClause",
                        state: "expand"
                    },
                    {
                        id: Ids.foxNounPhrase,
                        type: "nounPhrase",
                        state: "expand",
                        property: ["subject"]
                    },
                    {
                        id: Ids.foxNoun,
                        type: "noun",
                        state: "select",
                        property: ["head"]
                    }
                ]
            ).map(({ key, ...rest }) => rest);
            const expected: NoKey[] = [
                {
                    head: true,
                    id: Ids.quickBrownAdjPhrase,
                    type: "adjectivePhrase",
                    lexemes: [
                        "The",
                        "quick",
                        "brown"
                    ],
                    selected: false,
                    index: [0, 2]
                },
                {
                    head: true,
                    id: Ids.foxNoun,
                    type: "noun",
                    lexemes: ["fox"],
                    selected: true,
                    index: 3
                },
                {
                    head: true,
                    id: Ids.jumpsVerbPhrase,
                    type: "verbPhrase",
                    lexemes: [
                        "jumps",
                        "over",
                        "the",
                        "lazy",
                        "dog"
                    ],
                    selected: false,
                    index: [4, 8]
                }
            ];
            assert.deepStrictEqual(result, expected);
        });
    });
});