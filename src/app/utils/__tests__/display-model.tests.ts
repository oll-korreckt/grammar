import { createState, Ids } from "@app/testing";
import { ElementType } from "@domain/language";
import { AtomicChange } from "@lib/utils";
import { assert } from "chai";
import { DiagramState, TypedDiagramStateItem } from "../diagram-state";
import { DisplayModel, Progress, TypedDisplayModelElement, WordIndices, WordRange, _appendWord, _calcSyntaxProgress, ProgressPreOutput } from "../display-model";

function createElement<Type extends ElementType>(type: Type, element: TypedDisplayModelElement<Type>): TypedDisplayModelElement<Type> {
    return element;
}

describe("DisplayModel", () => {
    let state: DiagramState;
    beforeEach(() => {
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
        assert.deepStrictEqual(result, expected);
    });

    describe("calcProgress", () => {
        test("100%", () => {
            const input = DisplayModel.init(state);
            const result = DisplayModel.calcProgress(input);
            const expected: Progress = {
                category: {
                    percentage: 100,
                    errorItems: []
                },
                syntax: {
                    percentage: 100,
                    errorItems: []
                }
            };
            assert.deepStrictEqual(result, expected);
        });

        test("with incomplete partOfSpeech", () => {
            const input: DisplayModel = {
                to: {
                    type: "word",
                    category: "word",
                    words: [0],
                    ref: "preposition"
                },
                eat: {
                    type: "word",
                    category: "word",
                    words: [1],
                    ref: "infinitive"
                },
                preposition: {
                    type: "preposition",
                    category: "partOfSpeech",
                    words: [0],
                    properties: {
                        words: ["to"]
                    }
                },
                verb: {
                    type: "infinitive",
                    category: "partOfSpeech",
                    words: [1],
                    properties: {
                        verb: ["eat"]
                    }
                }
            };
            const result = DisplayModel.calcProgress(input);
            const expected: Progress = {
                category: {
                    percentage: 50 * 0.9,
                    errorItems: ["verb"]
                },
                syntax: {
                    percentage: 0,
                    errorItems: []
                }
            };
            assert.deepStrictEqual(result, expected);
        });

        test("with incomplete phraseAndClause - low level", () => {
            const changes = DiagramState.setTypedReference(state, "prepositionPhrase", Ids.overPrepPhrase, "head", undefined);
            state = AtomicChange.apply(state, ...changes);
            const input = DisplayModel.init(state);
            const result = DisplayModel.calcProgress(input);
            const expected: Progress = {
                category: {
                    percentage: 100,
                    errorItems: []
                },
                syntax: {
                    percentage: (8 / 9) * 50 + Math.pow((8 / 9) * 0.9, 0.4) * 50,
                    errorItems: [Ids.overPrepPhrase]
                }
            };
            assert.deepStrictEqual(result, expected);
        });

        test("with incomplete phraseAndClause - top level", () => {
            const changes = DiagramState.setTypedReference(state, "verbPhrase", Ids.jumpsVerbPhrase, "headModifier", undefined);
            state = AtomicChange.apply(state, ...changes);
            const input = DisplayModel.init(state);
            const result = DisplayModel.calcProgress(input);
            const expected: Progress = {
                category: {
                    percentage: 100,
                    errorItems: []
                },
                syntax: {
                    percentage: (5 / 9) * 50 + 50,
                    errorItems: []
                }
            };
            assert.deepStrictEqual(result, expected);
        });
    });

    describe("_calcPhraseAndClauseProgress", () => {
        const partOfSpeech: ProgressPreOutput["category"] = {
            count: 0,
            errorItems: []
        };

        test("100% - no nonIndClause", () => {
            const input: ProgressPreOutput = {
                wordCount: 100,
                category: partOfSpeech,
                syntax: {
                    nonIndClause: { count: 0, errorItems: [] },
                    indClause: { count: 100, errorItems: [] }
                }
            };
            const result = _calcSyntaxProgress(input);
            const expected: Progress[keyof Progress] = {
                percentage: 100,
                errorItems: []
            };
            assert.deepStrictEqual(result, expected);
        });

        test("100% - both", () => {
            const input: ProgressPreOutput = {
                wordCount: 100,
                category: partOfSpeech,
                syntax: {
                    nonIndClause: { count: 100, errorItems: [] },
                    indClause: { count: 100, errorItems: [] }
                }
            };
            const result = _calcSyntaxProgress(input);
            const expected: Progress[keyof Progress] = {
                percentage: 100,
                errorItems: []
            };
            assert.deepStrictEqual(result, expected);
        });

        test("no indClause", () => {
            const input: ProgressPreOutput = {
                wordCount: 100,
                category: partOfSpeech,
                syntax: {
                    nonIndClause: { count: 80, errorItems: [] },
                    indClause: { count: 0, errorItems: [] }
                }
            };
            const result = _calcSyntaxProgress(input);
            const expected: Progress[keyof Progress] = {
                percentage: Math.pow(0.8, 0.4) * 100 * 0.5,
                errorItems: []
            };
            assert.deepStrictEqual(result, expected);
        });

        test("partial both", () => {
            const input: ProgressPreOutput = {
                wordCount: 100,
                category: partOfSpeech,
                syntax: {
                    nonIndClause: { count: 30, errorItems: [] },
                    indClause: { count: 50, errorItems: [] }
                }
            };
            const result = _calcSyntaxProgress(input);
            const expected: Progress[keyof Progress] = {
                percentage: (50 + Math.pow(0.3, 0.4) * 100) / 2,
                errorItems: []
            };
            assert.deepStrictEqual(result, expected);
        });

        test("with error items", () => {
            const input: ProgressPreOutput = {
                wordCount: 100,
                category: partOfSpeech,
                syntax: {
                    nonIndClause: { count: 40, errorItems: ["a"] },
                    indClause: { count: 80, errorItems: ["b", "c"] }
                }
            };
            const result = _calcSyntaxProgress(input);
            result.percentage = Math.round(result.percentage * 100) / 100;
            const expected: Progress[keyof Progress] = {
                percentage: (80 * Math.pow(0.9, 2) + Math.pow(40 / 100 * Math.pow(0.9, 1), 0.4) * 100) / 2,
                errorItems: ["a", "b", "c"]
            };
            expected.percentage = Math.round(expected.percentage * 100) / 100;
            assert.deepStrictEqual(result, expected);
        });

        test("indClause complete - errors in nonIndClause", () => {
            const input: ProgressPreOutput = {
                wordCount: 100,
                category: partOfSpeech,
                syntax: {
                    nonIndClause: { count: 10, errorItems: ["a", "b"] },
                    indClause: { count: 100, errorItems: [] }
                }
            };
            const result = _calcSyntaxProgress(input);
            const expected: Progress[keyof Progress] = {
                percentage: 50 + Math.pow(10 / 100 * Math.pow(0.9, 2), 0.4) * 50,
                errorItems: ["a", "b"]
            };
            assert.deepStrictEqual(result, expected);
        });
    });

    describe("WordRange - expand", () => {
        test("overlap", () => {
            const result = WordRange.expand([2, 2]);
            assert.deepStrictEqual(result, [2]);
        });

        test("range", () => {
            const result = WordRange.expand([1, 5]);
            assert.deepStrictEqual(
                result,
                [1, 2, 3, 4, 5]
            );
        });

        test("error", () => {
            assert.throw(
                () => WordRange.expand([1, 0]),
                /cannot expand/i
            );
        });
    });
});