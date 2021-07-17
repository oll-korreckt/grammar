import { AdjectivePhrase, ElementReference } from "@domain/language";
import { AtomicChange, ChangeKey, ChangeType } from "@lib/utils";
import { assert } from "chai";
import { DiagramState, TypedDiagramStateItem } from "../diagram-state";

function sortElementReferences(x: ElementReference, y: ElementReference): number {
    if (x.id > y.id) {
        return 1;
    } else if (x.id < y.id) {
        return -1;
    } else {
        return 0;
    }
}

function getElementId(key: ChangeKey): string {
    return key[1] as string;
}

describe("DiagramState", () => {
    let state: DiagramState;
    beforeEach(() => {
        state = DiagramState.fromText("The quick brown fox jumps over the lazy dog.");
    });

    test("fromText", () => {
        const words = [
            "The",
            "quick",
            "brown",
            "fox",
            "jumps",
            "over",
            "the",
            "lazy",
            "dog."
        ];
        state.wordOrder.forEach((id, index) => {
            const { value } = DiagramState.getTypedItem(state, "word", id);
            assert.strictEqual(value.lexeme, words[index]);
        });
    });

    describe("getItem", () => {
        test("error", () => {
            assert.throw(
                () => DiagramState.getItem(state, ""),
                /does not exist/i
            );
        });
    });

    describe("getTypedItem", () => {
        test("error - does not exist", () => {
            assert.throw(
                () => DiagramState.getItem(state, ""),
                /does not exist/i
            );
        });

        test("error - type", () => {
            const id = state.wordOrder[0];
            assert.throw(
                () => DiagramState.getTypedItem(state, "adverbPhrase", id),
                /does not have type adverbphrase/i
            );
        });
    });

    test("getElementReferences", () => {
        const input: AdjectivePhrase = {
            id: "0",
            phraseType: "adjective",
            head: {
                type: "adjective",
                id: "1"
            },
            determiner: {
                type: "determiner",
                id: "2"
            },
            modifiers: [
                {
                    type: "adverb",
                    id: "3"
                },
                {
                    type: "adverbPhrase",
                    id: "4"
                }
            ],
            complement: {
                type: "noun",
                id: "5"
            }
        };
        const result = DiagramState.getElementReferences("adjectivePhrase", input);
        const expected: ElementReference[] = [
            {
                type: "adjective",
                id: "1"
            },
            {
                type: "determiner",
                id: "2"
            },
            {
                type: "adverb",
                id: "3"
            },
            {
                type: "adverbPhrase",
                id: "4"
            },
            {
                type: "noun",
                id: "5"
            }
        ];
        result.sort(sortElementReferences);
        expected.sort(sortElementReferences);
        assert.deepStrictEqual(result, expected);
    });

    describe("getWordIndex", () => {
        test("standard", () => {
            const id = state.wordOrder[3];
            const result = DiagramState.getWordIndex(state, id);
            assert.strictEqual(result, 3);
        });

        test("error", () => {
            assert.throw(
                () => DiagramState.getWordIndex(state, ""),
                /not a word/i
            );
        });
    });

    test("createWordSorter", () => {
        const unsortedWordIds = Object.keys(state.elements);
        const sorter = DiagramState.createWordSorter(state);
        const result = unsortedWordIds.sort(sorter);
        assert.deepStrictEqual(result, state.wordOrder);
    });

    test("createAddItem", () => {
        const result = DiagramState.createAddItem("adverbPhrase");
        if (result.type !== ChangeType.Set) {
            assert.fail();
        }
        assert.deepStrictEqual(result.key, ["elements", result.key[1]]);
        assert.isUndefined(result.currVal);
        const expected: TypedDiagramStateItem<"adverbPhrase"> = {
            type: "adverbPhrase",
            value: {
                id: getElementId(result.key),
                phraseType: "adverb"
            }
        };
        assert.deepStrictEqual(result.newVal, expected);
    });

    describe("createDeleteItem", () => {
        test("standard", () => {
            const addNoun = DiagramState.createAddItem("noun");
            const nounId = getElementId(addNoun.key);
            state = AtomicChange.apply(state, addNoun);
            const addNounPhrase = DiagramState.createAddItem("nounPhrase");
            const nounPhraseId = getElementId(addNounPhrase.key);
            state = AtomicChange.apply(state, addNounPhrase);
            const addAdjectivePhrase = DiagramState.createAddItem("adjectivePhrase");
            const adjectivePhraseId = getElementId(addAdjectivePhrase.key);
            state = AtomicChange.apply(state, addAdjectivePhrase);
            const addIndependentClause = DiagramState.createAddItem("independentClause");
            const independentClauseId = getElementId(addIndependentClause.key);
            state = AtomicChange.apply(state, addIndependentClause);
            state = AtomicChange.apply(state, ...DiagramState.createAddReference(state, "nounPhrase", nounPhraseId, "head", nounId));
            state = AtomicChange.apply(state, ...DiagramState.createAddReference(state, "nounPhrase", nounPhraseId, "modifiers", adjectivePhraseId));
            state = AtomicChange.apply(state, ...DiagramState.createAddReference(state, "independentClause", independentClauseId, "subject", nounPhraseId));
            const result = DiagramState.createDeleteItem(state, nounPhraseId).sort((a, b) => ChangeKey.sort(a.key, b.key));
            const expected: AtomicChange[] = [
                // delete children refs
                AtomicChange.createDelete(
                    ["elements", nounId, "ref"],
                    DiagramState.getItem(state, nounId).ref
                ),
                AtomicChange.createDelete(
                    ["elements", adjectivePhraseId, "ref"],
                    DiagramState.getItem(state, adjectivePhraseId).ref
                ),
                // delete parent ref
                AtomicChange.createDelete(
                    ["elements", independentClauseId, "value", "subject"],
                    DiagramState.getTypedItem(state, "independentClause", independentClauseId).value.subject
                ),
                // delete the nounPhrase
                AtomicChange.createDelete(
                    ["elements", nounPhraseId],
                    DiagramState.getItem(state, nounPhraseId)
                )
            ].sort((a, b) => ChangeKey.sort(a.key, b.key));
            assert.deepEqual(result, expected);
        });

        test("error - delete word", () => {
            assert.throw(
                () => DiagramState.createDeleteItem(state, state.wordOrder[3]),
                /cannot delete words/i
            );
        });

        test("error - referenced by word", () => {
            const addNoun = DiagramState.createAddItem("noun");
            const nounId = getElementId(addNoun.key);
            state = AtomicChange.apply(state, addNoun);
            state = AtomicChange.apply(state, AtomicChange.createSet(
                ["elements", nounId, "ref"],
                DiagramState.getItem(state, nounId).ref,
                state.wordOrder[3]
            ));
            assert.throw(
                () => DiagramState.createDeleteItem(state, nounId),
                /'word' element type/i
            );
        });

        test("error - parent does not reference", () => {
            const addNoun = DiagramState.createAddItem("noun");
            const nounId = getElementId(addNoun.key);
            const addNounPhrase = DiagramState.createAddItem("nounPhrase");
            const nounPhraseId = getElementId(addNounPhrase.key);
            state = AtomicChange.apply(state, addNoun);
            state = AtomicChange.apply(state, AtomicChange.createSet(
                ["elements", nounId, "ref"],
                undefined,
                nounPhraseId
            ));
            state = AtomicChange.apply(state, addNounPhrase);
            assert.throw(
                () => DiagramState.createDeleteItem(state, nounId),
                /does not reference child/i
            );
        });
    });

    describe("createAddReference", () => {
        test("standard", () => {
            const wordId = state.wordOrder[3];
            const addNoun = DiagramState.createAddItem("noun");
            state = AtomicChange.apply(state, addNoun);
            const nounId = getElementId(addNoun.key);
            const result = DiagramState.createAddReference(state, "noun", nounId, "words", wordId);
            const expected = [
                AtomicChange.createSet(
                    ["elements", nounId, "value", "words"],
                    undefined,
                    [{ id: wordId, type: "word" }]
                ),
                AtomicChange.createSet(
                    ["elements", wordId, "ref"],
                    undefined,
                    nounId
                )
            ];
            assert.deepEqual(result, expected);
        });

        test("error - reference not allowed", () => {
            const wordId = state.wordOrder[4];
            const addVerbPhrase = DiagramState.createAddItem("verbPhrase");
            const verbPhraseId = getElementId(addVerbPhrase.key);
            state = AtomicChange.apply(state, addVerbPhrase);
            assert.throw(
                () => DiagramState.createAddReference(state, "verbPhrase", verbPhraseId, "head", wordId),
                /element is not allowed to reference a/i
            );
        });

        test("error - reference already exists - array property", () => {
            const wordId = state.wordOrder[3];
            const addNoun = DiagramState.createAddItem("noun");
            state = AtomicChange.apply(state, addNoun);
            const nounId = getElementId(addNoun.key);
            state = AtomicChange.apply(state, ...DiagramState.createAddReference(state, "noun", nounId, "words", wordId));
            assert.throw(
                () => DiagramState.createAddReference(state, "noun", nounId, "words", wordId),
                /already contains a reference to/i
            );
        });

        test("error - reference already exists - object property", () => {
            const addVerb = DiagramState.createAddItem("verb");
            state = AtomicChange.apply(state, addVerb);
            const verbId = getElementId(addVerb.key);
            const addVerbPhrase = DiagramState.createAddItem("verbPhrase");
            state = AtomicChange.apply(state, addVerbPhrase);
            const verbPhraseId = getElementId(addVerbPhrase.key);
            state = AtomicChange.apply(state, ...DiagramState.createAddReference(state, "verbPhrase", verbPhraseId, "head", verbId));
            assert.throw(
                () => DiagramState.createAddReference(state, "verbPhrase", verbPhraseId, "head", verbId),
                /already references/i
            );
        });
    });

    describe("createDeleteReference", () => {
        test("standard", () => {
            const wordId = state.wordOrder[3];
            const addNoun = DiagramState.createAddItem("noun");
            const nounId = getElementId(addNoun.key);
            state = AtomicChange.apply(state, addNoun);
            state = AtomicChange.apply(state, ...DiagramState.createAddReference(state, "noun", nounId, "words", wordId));
            const result = DiagramState.createDeleteReference(state, "noun", nounId, "words", wordId);
            const expected = [
                AtomicChange.createDelete(
                    ["elements", nounId, "value", "words"],
                    DiagramState.getTypedItem(state, "noun", nounId).value.words
                ),
                AtomicChange.createDelete(
                    ["elements", wordId, "ref"],
                    DiagramState.getItem(state, wordId).ref
                )
            ];
            assert.deepEqual(result, expected);
        });

        test("error - no property", () => {
            const addNoun = DiagramState.createAddItem("noun");
            const nounId = getElementId(addNoun.key);
            state = AtomicChange.apply(state, addNoun);
            assert.throw(
                () => DiagramState.createDeleteReference(state, "noun", nounId, "words", ""),
                /does not have a 'words' property/i
            );
        });

        test("error - array - parent does not reference", () => {
            const addNoun = DiagramState.createAddItem("noun");
            const nounId = getElementId(addNoun.key);
            state = AtomicChange.apply(state, addNoun);
            state = AtomicChange.apply(state, ...DiagramState.createAddReference(state, "noun", nounId, "words", state.wordOrder[3]));
            assert.throw(
                () => DiagramState.createDeleteReference(state, "noun", nounId, "words", state.wordOrder[8]),
                /element does not contain a reference/i
            );
        });

        test("error - array - parent has multiple references", () => {
            const wordId = state.wordOrder[3];
            const addNoun = DiagramState.createAddItem("noun");
            const nounId = getElementId(addNoun.key);
            state = AtomicChange.apply(state, addNoun);
            state = AtomicChange.apply(state, ...DiagramState.createAddReference(state, "noun", nounId, "words", wordId));
            state = AtomicChange.apply(state, AtomicChange.createSet(
                ["elements", wordId, "ref"],
                DiagramState.getItem(state, wordId).ref,
                [DiagramState.getItem(state, wordId).ref, nounId]
            ));
            const words = DiagramState.getTypedItem(state, "noun", nounId).value.words;
            if (words === undefined) {
                throw "should not be undefined";
            }
            state = AtomicChange.apply(state, AtomicChange.createSet(
                ["elements", nounId, "value", "words"],
                words,
                [...words, { id: wordId, type: "word" }]
            ));
            assert.throw(
                () => DiagramState.createDeleteReference(state, "noun", nounId, "words", wordId),
                /element contains multiple/i
            );
        });

        test("error - object - parent does not reference", () => {
            const addVerb = DiagramState.createAddItem("verb");
            const addVerbId = getElementId(addVerb.key);
            const addVerbPhrase = DiagramState.createAddItem("verbPhrase");
            const addVerbPhraseId = getElementId(addVerbPhrase.key);
            state = AtomicChange.apply(state, addVerb, addVerbPhrase);
            state = AtomicChange.apply(state, ...DiagramState.createAddReference(state, "verbPhrase", addVerbPhraseId, "head", addVerbId));
            state = AtomicChange.apply(state, AtomicChange.createSet(
                ["elements", addVerbPhraseId, "value", "head"],
                DiagramState.getTypedItem(state, "verbPhrase", addVerbPhraseId).value.head,
                {
                    id: state.wordOrder[4],
                    type: "word"
                }
            ));
            assert.throw(
                () => DiagramState.createDeleteReference(state, "verbPhrase", addVerbPhraseId, "head", addVerbId),
                /element does not reference/i
            );
        });

        test("error - child not referenced", () => {
            const wordId = state.wordOrder[3];
            const addNoun = DiagramState.createAddItem("noun");
            const nounId = getElementId(addNoun.key);
            state = AtomicChange.apply(state, addNoun);
            state = AtomicChange.apply(state, ...DiagramState.createAddReference(state, "noun", nounId, "words", wordId));
            state = AtomicChange.apply(state, AtomicChange.createDelete(
                ["elements", wordId, "ref"],
                DiagramState.getItem(state, wordId).ref
            ));
            assert.throw(
                () => DiagramState.createDeleteReference(state, "noun", nounId, "words", wordId),
                /is not referenced by/i
            );
        });
    });
});