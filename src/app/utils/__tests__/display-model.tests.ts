import { createState, Ids } from "@app/testing";
import { ElementType } from "@domain/language";
import { assert } from "chai";
import { DiagramState, TypedDiagramStateItem } from "../diagram-state";
import { DisplayModel, TypedDisplayModelElement, WordIndices, _appendWord } from "../display-model";

function createElement<Type extends ElementType>(type: Type, element: TypedDisplayModelElement<Type>): TypedDisplayModelElement<Type> {
    return element;
}

describe("DisplayModel", () => {
    let state: DiagramState;
    beforeAll(() => {
        state = createState();
    });

    describe("_appendWord", () => {
        test("empty array", () => {
            const input: WordIndices = [];
            _appendWord(input, 5);
            assert.deepStrictEqual(input, [5]);
        });
        test("1 entry - adjacent", () => {
            const input: WordIndices = [5];
            _appendWord(input, 6);
            assert.deepStrictEqual(input, [[5, 6]]);
        });
        test("1 entry - non adjacent", () => {
            const input: WordIndices = [5];
            _appendWord(input, 7);
            assert.deepStrictEqual(input, [5, 7]);
        });
        test("range entry - adjacent", () => {
            const input: WordIndices = [[5, 6]];
            _appendWord(input, 7);
            assert.deepStrictEqual(input, [[5, 7]]);
        });
        test("range entry - non adjacent", () => {
            const input: WordIndices = [[5, 6]];
            _appendWord(input, 8);
            assert.deepStrictEqual(input, [[5, 6], 8]);
        });
    });

    test("init - 1", () => {
        const result = DisplayModel.init(state);
        const expected: DisplayModel = {
            [Ids.the1]: {
                category: "word",
                type: "word",
                words: [0],
                ref: Ids.the1Det
            },
            [Ids.quick]: {
                category: "word",
                type: "word",
                words: [1],
                ref: Ids.quickBrownAdj
            },
            [Ids.brown]: {
                category: "word",
                type: "word",
                words: [2],
                ref: Ids.quickBrownAdj
            },
            [Ids.fox]: {
                category: "word",
                type: "word",
                words: [3],
                ref: Ids.foxNoun
            },
            [Ids.jumps]: {
                category: "word",
                type: "word",
                words: [4],
                ref: Ids.jumpsVerb
            },
            [Ids.over]: {
                category: "word",
                type: "word",
                words: [5],
                ref: Ids.overPrep
            },
            [Ids.the2]: {
                category: "word",
                type: "word",
                words: [6],
                ref: Ids.the2Det
            },
            [Ids.lazy]: {
                category: "word",
                type: "word",
                words: [7],
                ref: Ids.lazyAdj
            },
            [Ids.dog]: {
                category: "word",
                type: "word",
                words: [8],
                ref: Ids.dogNoun
            },
            [Ids.the1Det]: createElement("determiner", {
                category: "partOfSpeech",
                type: "determiner",
                words: [0],
                ref: Ids.quickBrownAdjPhrase,
                properties: {
                    words: [Ids.the1]
                }
            }),
            [Ids.quickBrownAdj]: createElement("adjective", {
                category: "partOfSpeech",
                type: "adjective",
                words: [[1, 2]],
                ref: Ids.quickBrownAdjPhrase,
                properties: {
                    words: [Ids.quick, Ids.brown]
                }
            }),
            [Ids.foxNoun]: createElement("noun", {
                category: "partOfSpeech",
                type: "noun",
                words: [3],
                ref: Ids.foxNounPhrase,
                properties: {
                    words: [Ids.fox]
                }
            }),
            [Ids.jumpsVerb]: createElement("verb", {
                category: "partOfSpeech",
                type: "verb",
                words: [4],
                ref: Ids.jumpsVerbPhrase,
                properties: {
                    mainVerb: [Ids.jumps]
                }
            }),
            [Ids.overPrep]: createElement("preposition", {
                category: "partOfSpeech",
                type: "preposition",
                words: [5],
                ref: Ids.overPrepPhrase,
                properties: {
                    words: [Ids.over]
                }
            }),
            [Ids.the2Det]: createElement("determiner", {
                category: "partOfSpeech",
                type: "determiner",
                words: [6],
                ref: Ids.lazyAdjPhrase,
                properties: {
                    words: [Ids.the2]
                }
            }),
            [Ids.lazyAdj]: createElement("adjective", {
                category: "partOfSpeech",
                type: "adjective",
                words: [7],
                ref: Ids.lazyAdjPhrase,
                properties: {
                    words: [Ids.lazy]
                }
            }),
            [Ids.dogNoun]: createElement("noun", {
                category: "partOfSpeech",
                type: "noun",
                words: [8],
                ref: Ids.dogNounPhrase,
                properties: {
                    words: [Ids.dog]
                }
            }),
            [Ids.quickBrownAdjPhrase]: createElement("adjectivePhrase", {
                category: "phrase",
                type: "adjectivePhrase",
                words: [[0, 2]],
                ref: Ids.foxNounPhrase,
                properties: {
                    determiner: [Ids.the1Det],
                    head: [Ids.quickBrownAdj]
                }
            }),
            [Ids.foxNounPhrase]: createElement("nounPhrase", {
                category: "phrase",
                type: "nounPhrase",
                words: [[0, 3]],
                ref: Ids.indClause,
                properties: {
                    modifiers: [Ids.quickBrownAdjPhrase],
                    head: [Ids.foxNoun]
                }
            }),
            [Ids.jumpsVerbPhrase]: createElement("verbPhrase", {
                category: "phrase",
                type: "verbPhrase",
                words: [[4, 8]],
                ref: Ids.indClause,
                properties: {
                    head: [Ids.jumpsVerb],
                    headModifier: [Ids.overPrepPhrase]
                }
            }),
            [Ids.overPrepPhrase]: createElement("prepositionPhrase", {
                category: "phrase",
                type: "prepositionPhrase",
                words: [[5, 8]],
                ref: Ids.jumpsVerbPhrase,
                properties: {
                    head: [Ids.overPrep],
                    object: [Ids.dogNounPhrase]
                }
            }),
            [Ids.lazyAdjPhrase]: createElement("adjectivePhrase", {
                category: "phrase",
                type: "adjectivePhrase",
                words: [[6, 7]],
                ref: Ids.dogNounPhrase,
                properties: {
                    determiner: [Ids.the2Det],
                    head: [Ids.lazyAdj]
                }
            }),
            [Ids.dogNounPhrase]: createElement("nounPhrase", {
                category: "phrase",
                type: "nounPhrase",
                words: [[6, 8]],
                ref: Ids.overPrepPhrase,
                properties: {
                    modifiers: [Ids.lazyAdjPhrase],
                    head: [Ids.dogNoun]
                }
            }),
            [Ids.indClause]: createElement("independentClause", {
                category: "clause",
                type: "independentClause",
                words: [[0, 8]],
                properties: {
                    subject: [Ids.foxNounPhrase],
                    predicate: [Ids.jumpsVerbPhrase]
                }
            })
        };
        assert.deepStrictEqual(result, expected);
    });

    test("init - 2", () => {
        const catsWord: TypedDiagramStateItem<"word"> = {
            type: "word",
            ref: "catsNoun",
            value: {
                id: "cats",
                lexeme: "cats"
            }
        };
        const catsNoun: TypedDiagramStateItem<"noun"> = {
            type: "noun",
            ref: "coordNoun",
            value: {
                id: "catsNoun",
                posType: "noun",
                words: [{ id: "catsWord", type: "word" }]
            }
        };
        const andWord: TypedDiagramStateItem<"word"> = {
            type: "word",
            ref: "andCoord",
            value: {
                id: "andWord",
                lexeme: "and"
            }
        };
        const andCoord: TypedDiagramStateItem<"coordinator"> = {
            type: "coordinator",
            ref: "coordNoun",
            value: {
                id: "andCoord",
                posType: "coordinator",
                words: [{ id: "andWord", type: "word" }]
            }
        };
        const dogsWord: TypedDiagramStateItem<"word"> = {
            type: "word",
            ref: "dogsNoun",
            value: {
                id: "dogsWord",
                lexeme: "dogs"
            }
        };
        const dogsNoun: TypedDiagramStateItem<"noun"> = {
            type: "noun",
            ref: "coordNoun",
            value: {
                id: "dogsNoun",
                posType: "noun",
                words: [{ id: "dogsWord", type: "word" }]
            }
        };
        const coordNoun: TypedDiagramStateItem<"coordinatedNoun"> = {
            type: "coordinatedNoun",
            value: {
                id: "coordNoun",
                posType: "noun",
                itemType: "noun",
                coordinator: { id: "andCoord", type: "coordinator" },
                items: [
                    { id: "catsNoun", type: "noun" },
                    { id: "dogsNoun", type: "noun" }
                ]
            }
        };
        const input: DiagramState = {
            wordOrder: ["catsWord", "andWord", "dogsWord"],
            elements: {
                catsWord: catsWord,
                catsNoun: catsNoun,
                andWord: andWord,
                andCoord: andCoord,
                dogsWord: dogsWord,
                dogsNoun: dogsNoun,
                coordNoun: coordNoun
            }
        };
        const result = DisplayModel.init(input);
        const expected: DisplayModel = {
            catsWord: createElement("word", {
                category: "word",
                type: "word",
                words: [0],
                ref: "catsNoun"
            }),
            catsNoun: createElement("word", {
                category: "partOfSpeech",
                type: "noun",
                words: [0],
                ref: "coordNoun",
                properties: {
                    words: ["catsWord"]
                }
            }),
            andWord: createElement("word", {
                category: "word",
                type: "word",
                words: [1],
                ref: "andCoord"
            }),
            andCoord: createElement("coordinator", {
                category: "partOfSpeech",
                type: "coordinator",
                words: [1],
                ref: "coordNoun",
                properties: {
                    words: ["andWord"]
                }
            }),
            dogsWord: createElement("word", {
                category: "word",
                type: "word",
                words: [2],
                ref: "dogsNoun"
            }),
            dogsNoun: createElement("noun", {
                category: "partOfSpeech",
                type: "noun",
                words: [2],
                ref: "coordNoun",
                properties: {
                    words: ["dogsWord"]
                }
            }),
            coordNoun: createElement("coordinatedNoun", {
                category: "partOfSpeech",
                type: "coordinatedNoun",
                words: [[0, 2]],
                properties: {
                    coordinator: ["andCoord"],
                    items: ["catsNoun", "dogsNoun"]
                }
            })
        };
        assert.deepStrictEqual(result.elements, expected.elements);
    });
});