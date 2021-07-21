import { ElementId } from "@domain/language";
import { AtomicChange } from "@lib/utils";
import { assert } from "chai";
import { DiagramState, TypedDiagramStateItem } from "../diagram-state";
import { DisplayModel } from "../display-model";

function getElementId(change: AtomicChange): ElementId {
    return change.key[1] as string;
}

describe("DisplayModel", () => {
    let state: DiagramState;
    let theDet1: AtomicChange;
    let quickBrownAdj: AtomicChange;
    let foxNoun: AtomicChange;
    let jumpsVerb: AtomicChange;
    let overPrep: AtomicChange;
    let theDet2: AtomicChange;
    let lazyAdj: AtomicChange;
    let dogNoun: AtomicChange;
    let adjPhrase1: AtomicChange;
    let nounPhrase1: AtomicChange;
    let verbPhrase: AtomicChange;
    let prepPhrase: AtomicChange;
    let adjPhrase2: AtomicChange;
    let nounPhrase2: AtomicChange;
    let indClause: AtomicChange;
    beforeAll(() => {
        state = DiagramState.fromText("The quick brown fox jumps over the lazy dog.");
        theDet1 = DiagramState.createAddItem("determiner");
        quickBrownAdj = DiagramState.createAddItem("adjective");
        foxNoun = DiagramState.createAddItem("noun");
        jumpsVerb = DiagramState.createAddItem("verb");
        overPrep = DiagramState.createAddItem("preposition");
        theDet2 = DiagramState.createAddItem("determiner");
        lazyAdj = DiagramState.createAddItem("adjective");
        dogNoun = DiagramState.createAddItem("noun");
        state = AtomicChange.apply(
            state,
            theDet1,
            quickBrownAdj,
            foxNoun,
            jumpsVerb,
            overPrep,
            theDet2,
            lazyAdj,
            dogNoun
        );
        state = AtomicChange.apply(
            state,
            ...DiagramState.createAddReference(
                state,
                "determiner",
                getElementId(theDet1),
                "words",
                state.wordOrder[0]
            ),
            ...DiagramState.createAddReference(
                state,
                "adjective",
                getElementId(quickBrownAdj),
                "words",
                state.wordOrder[1]
            )
        );
        state = AtomicChange.apply(
            state,
            ...DiagramState.createAddReference(
                state,
                "adjective",
                getElementId(quickBrownAdj),
                "words",
                state.wordOrder[2]
            ),
            ...DiagramState.createAddReference(
                state,
                "noun",
                getElementId(foxNoun),
                "words",
                state.wordOrder[3]
            ),
            ...DiagramState.createAddReference(
                state,
                "verb",
                getElementId(jumpsVerb),
                "mainVerb",
                state.wordOrder[4]
            ),
            ...DiagramState.createAddReference(
                state,
                "preposition",
                getElementId(overPrep),
                "words",
                state.wordOrder[5]
            ),
            ...DiagramState.createAddReference(
                state,
                "determiner",
                getElementId(theDet2),
                "words",
                state.wordOrder[6]
            ),
            ...DiagramState.createAddReference(
                state,
                "adjective",
                getElementId(lazyAdj),
                "words",
                state.wordOrder[7]
            ),
            ...DiagramState.createAddReference(
                state,
                "noun",
                getElementId(dogNoun),
                "words",
                state.wordOrder[8]
            )
        );
        adjPhrase1 = DiagramState.createAddItem("adjectivePhrase");
        nounPhrase1 = DiagramState.createAddItem("nounPhrase");
        verbPhrase = DiagramState.createAddItem("verbPhrase");
        prepPhrase = DiagramState.createAddItem("prepositionPhrase");
        adjPhrase2 = DiagramState.createAddItem("adjectivePhrase");
        nounPhrase2 = DiagramState.createAddItem("nounPhrase");
        state = AtomicChange.apply(
            state,
            adjPhrase1,
            nounPhrase1,
            verbPhrase,
            prepPhrase,
            adjPhrase2,
            nounPhrase2
        );
        state = AtomicChange.apply(
            state,
            ...DiagramState.createAddReference(
                state,
                "adjectivePhrase",
                getElementId(adjPhrase1),
                "determiner",
                getElementId(theDet1)
            ),
            ...DiagramState.createAddReference(
                state,
                "adjectivePhrase",
                getElementId(adjPhrase1),
                "head",
                getElementId(quickBrownAdj)
            ),
            ...DiagramState.createAddReference(
                state,
                "nounPhrase",
                getElementId(nounPhrase1),
                "head",
                getElementId(foxNoun)
            ),
            ...DiagramState.createAddReference(
                state,
                "nounPhrase",
                getElementId(nounPhrase1),
                "modifiers",
                getElementId(adjPhrase1)
            ),
            ...DiagramState.createAddReference(
                state,
                "verbPhrase",
                getElementId(verbPhrase),
                "head",
                getElementId(jumpsVerb)
            ),
            ...DiagramState.createAddReference(
                state,
                "verbPhrase",
                getElementId(verbPhrase),
                "headModifier",
                getElementId(prepPhrase)
            ),
            ...DiagramState.createAddReference(
                state,
                "prepositionPhrase",
                getElementId(prepPhrase),
                "head",
                getElementId(overPrep)
            ),
            ...DiagramState.createAddReference(
                state,
                "prepositionPhrase",
                getElementId(prepPhrase),
                "object",
                getElementId(nounPhrase2)
            ),
            ...DiagramState.createAddReference(
                state,
                "adjectivePhrase",
                getElementId(adjPhrase2),
                "determiner",
                getElementId(theDet2)
            ),
            ...DiagramState.createAddReference(
                state,
                "adjectivePhrase",
                getElementId(adjPhrase2),
                "head",
                getElementId(lazyAdj)
            ),
            ...DiagramState.createAddReference(
                state,
                "nounPhrase",
                getElementId(nounPhrase2),
                "head",
                getElementId(dogNoun)
            ),
            ...DiagramState.createAddReference(
                state,
                "nounPhrase",
                getElementId(nounPhrase2),
                "modifiers",
                getElementId(adjPhrase2)
            )
        );
        indClause = DiagramState.createAddItem("independentClause");
        state = AtomicChange.apply(state, indClause);
        state = AtomicChange.apply(
            state,
            ...DiagramState.createAddReference(
                state,
                "independentClause",
                getElementId(indClause),
                "subject",
                getElementId(nounPhrase1)
            ),
            ...DiagramState.createAddReference(
                state,
                "independentClause",
                getElementId(indClause),
                "predicate",
                getElementId(verbPhrase)
            )
        );
    });

    test("init - 1", () => {
        const result = DisplayModel.init(state);
        const expected: DisplayModel = {
            word: state.wordOrder,
            partOfSpeech: [
                getElementId(theDet1),
                getElementId(quickBrownAdj),
                getElementId(foxNoun),
                getElementId(jumpsVerb),
                getElementId(overPrep),
                getElementId(theDet2),
                getElementId(lazyAdj),
                getElementId(dogNoun)
            ],
            phrase: [
                getElementId(adjPhrase1),
                getElementId(nounPhrase1),
                getElementId(verbPhrase),
                getElementId(prepPhrase),
                getElementId(adjPhrase2),
                getElementId(nounPhrase2)
            ],
            clause: [getElementId(indClause)],
            elements: {
                [state.wordOrder[0]]: {
                    category: "word",
                    words: [0]
                },
                [state.wordOrder[1]]: {
                    category: "word",
                    words: [1]
                },
                [state.wordOrder[2]]: {
                    category: "word",
                    words: [2]
                },
                [state.wordOrder[3]]: {
                    category: "word",
                    words: [3]
                },
                [state.wordOrder[4]]: {
                    category: "word",
                    words: [4]
                },
                [state.wordOrder[5]]: {
                    category: "word",
                    words: [5]
                },
                [state.wordOrder[6]]: {
                    category: "word",
                    words: [6]
                },
                [state.wordOrder[7]]: {
                    category: "word",
                    words: [7]
                },
                [state.wordOrder[8]]: {
                    category: "word",
                    words: [8]
                },
                [getElementId(theDet1)]: {
                    category: "partOfSpeech",
                    words: [0]
                },
                [getElementId(quickBrownAdj)]: {
                    category: "partOfSpeech",
                    words: [1, 2]
                },
                [getElementId(foxNoun)]: {
                    category: "partOfSpeech",
                    words: [3]
                },
                [getElementId(jumpsVerb)]: {
                    category: "partOfSpeech",
                    words: [4]
                },
                [getElementId(overPrep)]: {
                    category: "partOfSpeech",
                    words: [5]
                },
                [getElementId(theDet2)]: {
                    category: "partOfSpeech",
                    words: [6]
                },
                [getElementId(lazyAdj)]: {
                    category: "partOfSpeech",
                    words: [7]
                },
                [getElementId(dogNoun)]: {
                    category: "partOfSpeech",
                    words: [8]
                },
                [getElementId(adjPhrase1)]: {
                    category: "phrase",
                    words: [1, 2]
                },
                [getElementId(nounPhrase1)]: {
                    category: "phrase",
                    words: [3]
                },
                [getElementId(verbPhrase)]: {
                    category: "phrase",
                    words: [4]
                },
                [getElementId(prepPhrase)]: {
                    category: "phrase",
                    words: [5]
                },
                [getElementId(adjPhrase2)]: {
                    category: "phrase",
                    words: [7]
                },
                [getElementId(nounPhrase2)]: {
                    category: "phrase",
                    words: [8]
                },
                [getElementId(indClause)]: {
                    category: "clause",
                    words: [3, 4]
                }
            }
        };
        assert.deepStrictEqual(result.word.sort(), expected.word.sort());
        assert.deepStrictEqual(result.partOfSpeech.sort(), expected.partOfSpeech.sort());
        assert.deepStrictEqual(result.phrase.sort(), expected.phrase.sort());
        assert.deepStrictEqual(result.clause.sort(), expected.clause.sort());
        assert.deepStrictEqual(result.elements, expected.elements);
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
            word: ["catsWord", "andWord", "dogsWord"],
            partOfSpeech: ["coordNoun"],
            phrase: [],
            clause: [],
            elements: {
                catsWord: {
                    category: "word",
                    words: [0]
                },
                catsNoun: {
                    category: "partOfSpeech",
                    words: [0]
                },
                andWord: {
                    category: "word",
                    words: [1]
                },
                andCoord: {
                    category: "partOfSpeech",
                    words: [1]
                },
                dogsWord: {
                    category: "word",
                    words: [2]
                },
                dogsNoun: {
                    category: "partOfSpeech",
                    words: [2]
                },
                coordNoun: {
                    category: "partOfSpeech",
                    words: [0, 1, 2]
                }
            }
        };
        assert.sameDeepMembers(result.word, expected.word);
        assert.sameDeepMembers(result.partOfSpeech, expected.partOfSpeech);
        assert.sameDeepMembers(result.phrase, expected.phrase);
        assert.sameDeepMembers(result.clause, expected.clause);
        assert.deepStrictEqual(result.elements, expected.elements);
    });
});