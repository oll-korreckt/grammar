import { ElementReference, Noun, Word, Coordinator, ElementMapper, Infinitive, NounPhrase, RelativeClause, VerbPhrase, AdjectivePhrase } from "@domain/language";
import { AtomicChange, ChangeKey, ChangeType } from "@lib/utils";
import { assert } from "chai";
import { DiagramState, ReferenceObject, TypedDiagramStateItem } from "../diagram-state";


function sortReferenceObject(obj: ReferenceObject): ReferenceObject {
    const output: ReferenceObject = {};
    Object.entries(obj).forEach(([key, value]) => {
        output[key] = value.sort(sortElementReferences);
    });
    return output;
}

function sortElementReferences(x: ElementReference, y: ElementReference): number {
    if (x.id > y.id) {
        return 1;
    } else if (x.id < y.id) {
        return -1;
    } else {
        return 0;
    }
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
        let result = DiagramState.getTypedElementReferences("adjectivePhrase", input);
        let expected: typeof result = {
            head: [{ type: "adjective", id: "1" }],
            determiner: [{ type: "determiner", id: "2" }],
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
            complement: [{ type: "noun", id: "5" }]
        };
        result = sortReferenceObject(result);
        expected = sortReferenceObject(expected);
        assert.deepStrictEqual(result, expected);
    });

    describe("getReferencingProperties", () => {
        test("standard - 1", () => {
            const input: NounPhrase = {
                id: "input",
                phraseType: "noun",
                head: { type: "noun", id: "a" }
            };
            const result = DiagramState.getReferencingProperties(
                "nounPhrase",
                input,
                "a"
            );
            const expected = "head";
            assert.deepStrictEqual(result, expected);
        });

        test("standard - 2", () => {
            const input: RelativeClause = {
                id: "input",
                clauseType: "relative",
                dependentWord: { type: "pronoun", id: "a" },
                subject: { type: "pronoun", id: "a" },
                predicate: { type: "verbPhrase", id: "b" }
            };
            const result = DiagramState.getReferencingProperties(
                "relativeClause",
                input,
                "a"
            ) as [string, string];
            if (result === undefined) {
                assert.fail();
            }
            result.sort();
            const expected = ["dependentWord", "subject"].sort() as [string, string];
            assert.deepStrictEqual(result, expected);
        });

        test("no references", () => {
            const input: RelativeClause = {
                id: "input",
                clauseType: "relative"
            };
            const result = DiagramState.getReferencingProperties("relativeClause", input, "a");
            assert.isUndefined(result);
        });

        test("error - more than 2 references", () => {
            const input: VerbPhrase = {
                id: "input",
                phraseType: "verb",
                head: { id: "a", type: "verb" },
                headModifier: { id: "a", type: "noun" },
                headCompl: { id: "a", type: "noun" }
            };
            assert.throw(
                () => DiagramState.getReferencingProperties("verbPhrase", input, "a"),
                /more than 2 references/i
            );
        });
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
        const [id, chg] = DiagramState.createAddItem("adverbPhrase");
        if (chg.type !== ChangeType.Set) {
            assert.fail();
        }
        assert.deepStrictEqual(chg.key, ["elements", chg.key[1]]);
        assert.isUndefined(chg.currVal);
        const expected: TypedDiagramStateItem<"adverbPhrase"> = {
            type: "adverbPhrase",
            value: {
                id: id,
                phraseType: "adverb"
            }
        };
        assert.deepStrictEqual(chg.newVal, expected);
    });

    describe("createDeleteItem", () => {
        test("standard", () => {
            const [nounId, addNoun] = DiagramState.createAddItem("noun");
            state = AtomicChange.apply(state, addNoun);
            const [nounPhraseId, addNounPhrase] = DiagramState.createAddItem("nounPhrase");
            state = AtomicChange.apply(state, addNounPhrase);
            const [adjectivePhraseId, addAdjectivePhrase] = DiagramState.createAddItem("adjectivePhrase");
            state = AtomicChange.apply(state, addAdjectivePhrase);
            const [independentClauseId, addIndependentClause] = DiagramState.createAddItem("independentClause");
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
            const [nounId, addNoun] = DiagramState.createAddItem("noun");
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
            const [nounId, addNoun] = DiagramState.createAddItem("noun");
            const [nounPhraseId, addNounPhrase] = DiagramState.createAddItem("nounPhrase");
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

    describe("createTypedAddReference", () => {
        test("standard", () => {
            const wordId = state.wordOrder[3];
            const [nounId, addNoun] = DiagramState.createAddItem("noun");
            state = AtomicChange.apply(state, addNoun);
            const result = DiagramState.createTypedAddReference(state, "noun", nounId, "words", wordId);
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

        test("switch parent", () => {
            const word1Id = state.wordOrder[2];
            const word2Id = state.wordOrder[3];
            const [infId, addInfinitive] = DiagramState.createAddItem("infinitive");
            state = AtomicChange.apply(state, addInfinitive);
            state = AtomicChange.apply(
                state,
                ...DiagramState.createTypedAddReference(
                    state,
                    "infinitive",
                    infId,
                    "to",
                    word1Id
                )
            );
            const result = DiagramState.createTypedAddReference(state, "infinitive", infId, "to", word2Id);
            const expected = [
                AtomicChange.createDelete(
                    ["elements", word1Id, "ref"],
                    infId
                ),
                AtomicChange.createSet(
                    ["elements", infId, "value", "to"],
                    { id: word1Id, type: "word" },
                    { id: word2Id, type: "word" }
                ),
                AtomicChange.createSet(
                    ["elements", word2Id, "ref"],
                    undefined,
                    infId
                )
            ];
            assert.deepStrictEqual(result, expected);
        });

        test("error - reference not allowed", () => {
            const wordId = state.wordOrder[4];
            const [verbPhraseId, addVerbPhrase] = DiagramState.createAddItem("verbPhrase");
            state = AtomicChange.apply(state, addVerbPhrase);
            assert.throw(
                () => DiagramState.createTypedAddReference(state, "verbPhrase", verbPhraseId, "head", wordId),
                /element is not allowed to reference a/i
            );
        });

        test("error - reference already exists - array property", () => {
            const wordId = state.wordOrder[3];
            const [nounId, addNoun] = DiagramState.createAddItem("noun");
            state = AtomicChange.apply(state, addNoun);
            state = AtomicChange.apply(state, ...DiagramState.createTypedAddReference(state, "noun", nounId, "words", wordId));
            assert.throw(
                () => DiagramState.createTypedAddReference(state, "noun", nounId, "words", wordId),
                /already contains a reference to/i
            );
        });

        test("error - reference already exists - object property", () => {
            const [verbId, addVerb] = DiagramState.createAddItem("verb");
            state = AtomicChange.apply(state, addVerb);
            const [verbPhraseId, addVerbPhrase] = DiagramState.createAddItem("verbPhrase");
            state = AtomicChange.apply(state, addVerbPhrase);
            state = AtomicChange.apply(state, ...DiagramState.createTypedAddReference(state, "verbPhrase", verbPhraseId, "head", verbId));
            assert.throw(
                () => DiagramState.createTypedAddReference(state, "verbPhrase", verbPhraseId, "head", verbId),
                /already references/i
            );
        });
    });

    describe("createTypedDeleteReference", () => {
        test("standard", () => {
            const wordId = state.wordOrder[3];
            const [nounId, addNoun] = DiagramState.createAddItem("noun");
            state = AtomicChange.apply(state, addNoun);
            state = AtomicChange.apply(state, ...DiagramState.createTypedAddReference(state, "noun", nounId, "words", wordId));
            const result = DiagramState.createTypedDeleteReference(state, "noun", nounId, "words", wordId);
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
            const [nounId, addNoun] = DiagramState.createAddItem("noun");
            state = AtomicChange.apply(state, addNoun);
            assert.throw(
                () => DiagramState.createTypedDeleteReference(state, "noun", nounId, "words", ""),
                /does not have a 'words' property/i
            );
        });

        test("error - array - parent does not reference", () => {
            const [nounId, addNoun] = DiagramState.createAddItem("noun");
            state = AtomicChange.apply(state, addNoun);
            state = AtomicChange.apply(state, ...DiagramState.createTypedAddReference(state, "noun", nounId, "words", state.wordOrder[3]));
            assert.throw(
                () => DiagramState.createTypedDeleteReference(state, "noun", nounId, "words", state.wordOrder[8]),
                /element does not contain a reference/i
            );
        });

        test("error - array - parent has multiple references", () => {
            const wordId = state.wordOrder[3];
            const [nounId, addNoun] = DiagramState.createAddItem("noun");
            state = AtomicChange.apply(state, addNoun);
            state = AtomicChange.apply(state, ...DiagramState.createTypedAddReference(state, "noun", nounId, "words", wordId));
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
                () => DiagramState.createTypedDeleteReference(state, "noun", nounId, "words", wordId),
                /element contains multiple/i
            );
        });

        test("error - object - parent does not reference", () => {
            const [addVerbId, addVerb] = DiagramState.createAddItem("verb");
            const [addVerbPhraseId, addVerbPhrase] = DiagramState.createAddItem("verbPhrase");
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
                () => DiagramState.createTypedDeleteReference(state, "verbPhrase", addVerbPhraseId, "head", addVerbId),
                /element does not reference/i
            );
        });

        test("error - child not referenced", () => {
            const wordId = state.wordOrder[3];
            const [nounId, addNoun] = DiagramState.createAddItem("noun");
            state = AtomicChange.apply(state, addNoun);
            state = AtomicChange.apply(state, ...DiagramState.createTypedAddReference(state, "noun", nounId, "words", wordId));
            state = AtomicChange.apply(state, AtomicChange.createDelete(
                ["elements", wordId, "ref"],
                DiagramState.getItem(state, wordId).ref
            ));
            assert.throw(
                () => DiagramState.createTypedDeleteReference(state, "noun", nounId, "words", wordId),
                /is not referenced by/i
            );
        });
    });

    describe("setReference + setTypedReference", () => {
        const catsId = "cats";
        const dogsId = "dogs";
        const miceId = "mice";
        const andId = "and";
        const menId = "men";
        const catsNounId = "catsNoun";
        const dogsNounId = "dogsNoun";
        const miceNounId = "miceNoun";
        const andCoordId = "andCoord";
        const menNounId = "menNoun";
        const coordNounId = "coordNoun";
        let setRefState: DiagramState;
        beforeEach(() => {
            const catsWord: Word = {
                id: catsId,
                lexeme: "Cats,"
            };
            const dogsWord: Word = {
                id: dogsId,
                lexeme: "dogs,"
            };
            const miceWord: Word = {
                id: miceId,
                lexeme: "mice,"
            };
            const andWord: Word = {
                id: andId,
                lexeme: "and"
            };
            const menWord: Word = {
                id: menId,
                lexeme: "men"
            };
            const catsNoun: Noun = {
                id: catsNounId,
                posType: "noun",
                words: [{
                    id: catsId,
                    type: "word"
                }]
            };
            const dogsNoun: Noun = {
                id: dogsNounId,
                posType: "noun",
                words: [{
                    id: dogsNounId,
                    type: "word"
                }]
            };
            const miceNoun: Noun = {
                id: miceNounId,
                posType: "noun",
                words: [{
                    id: miceNounId,
                    type: "word"
                }]
            };
            const andCoord: Coordinator = {
                id: andCoordId,
                posType: "coordinator",
                words: [{
                    id: andCoordId,
                    type: "word"
                }]
            };
            const menNoun: Noun = {
                id: menNounId,
                posType: "noun",
                words: [{
                    id: menId,
                    type: "word"
                }]
            };
            const coordNoun: ElementMapper<"coordinatedNoun"> = {
                id: coordNounId,
                posType: "noun",
                itemType: "noun",
                coordinator: {
                    id: andCoordId,
                    type: "coordinator"
                },
                items: [
                    {
                        id: catsNounId,
                        type: "noun"
                    },
                    {
                        id: dogsNounId,
                        type: "noun"
                    },
                    {
                        id: miceNounId,
                        type: "noun"
                    },
                    {
                        id: menNounId,
                        type: "noun"
                    }
                ]
            };
            setRefState = {
                wordOrder: [catsId, dogsId, miceId, andId, menId],
                elements: {
                    [catsId]: {
                        type: "word",
                        value: catsWord,
                        ref: catsNounId
                    },
                    [dogsId]: {
                        type: "word",
                        value: dogsWord,
                        ref: dogsNounId
                    },
                    [miceId]: {
                        type: "word",
                        value: miceWord,
                        ref: miceNounId
                    },
                    [andId]: {
                        type: "word",
                        value: andWord,
                        ref: andCoordId
                    },
                    [menId]: {
                        type: "word",
                        value: menWord,
                        ref: menNounId
                    },
                    [catsNounId]: {
                        type: "noun",
                        value: catsNoun,
                        ref: coordNounId
                    },
                    [dogsNounId]: {
                        type: "noun",
                        value: dogsNoun,
                        ref: coordNounId
                    },
                    [miceNounId]: {
                        type: "noun",
                        value: miceNoun,
                        ref: coordNounId
                    },
                    [andCoordId]: {
                        type: "coordinator",
                        value: andCoord,
                        ref: coordNounId
                    },
                    [menNounId]: {
                        type: "noun",
                        value: menNoun,
                        ref: coordNounId
                    },
                    [coordNounId]: {
                        type: "coordinatedNoun",
                        value: coordNoun
                    }
                }
            };
        });

        test("delete all -> add all", () => {
            // delete
            let changes = DiagramState.setTypedReference(setRefState, "coordinatedNoun", coordNounId, "items", undefined);
            setRefState = AtomicChange.apply(setRefState, ...changes);
            const ids = [
                catsNounId,
                dogsNounId,
                miceNounId,
                menNounId
            ];
            ids.forEach((id) => assert.isUndefined(setRefState.elements[id].ref));
            assert.isUndefined((setRefState.elements[coordNounId].value as ElementMapper<"coordinatedNoun">).items);
            // add
            const newRefs: ElementReference<"noun">[] = [
                { id: catsNounId, type: "noun" },
                { id: dogsNounId, type: "noun" },
                { id: miceNounId, type: "noun" },
                { id: menNounId, type: "noun" }
            ];
            changes = DiagramState.setTypedReference(setRefState, "coordinatedNoun", coordNounId, "items", newRefs);
            setRefState = AtomicChange.apply(setRefState, ...changes);
            ids.forEach((id) => assert.strictEqual(setRefState.elements[id].ref, coordNounId));
            assert.deepStrictEqual((setRefState.elements[coordNounId].value as ElementMapper<"coordinatedNoun">).items, newRefs);
        });

        test("partial delete -> partial add", () => {
            // partial delete
            const oldRefs = (setRefState.elements[coordNounId].value as ElementMapper<"coordinatedNoun">).items;
            if (oldRefs === undefined) {
                assert.fail();
            }
            const newRefs = oldRefs.filter((x) => x.id !== menNounId);
            let changes = DiagramState.setTypedReference(setRefState, "coordinatedNoun", coordNounId, "items", newRefs);
            setRefState = AtomicChange.apply(setRefState, ...changes);
            assert.isUndefined(setRefState.elements[menNounId].ref);
            newRefs.forEach((x) => assert.strictEqual(setRefState.elements[x.id].ref, coordNounId));
            assert.deepStrictEqual((setRefState.elements[coordNounId].value as ElementMapper<"coordinatedNoun">).items, newRefs);
            // partial add
            changes = DiagramState.setTypedReference(setRefState, "coordinatedNoun", coordNounId, "items", oldRefs);
            setRefState = AtomicChange.apply(setRefState, ...changes);
            oldRefs.forEach((x) => assert.strictEqual(setRefState.elements[x.id].ref, coordNounId));
            assert.deepStrictEqual((setRefState.elements[coordNounId].value as ElementMapper<"coordinatedNoun">).items, oldRefs);
        });

        test("delete single -> add single", () => {
            // delete
            let changes = DiagramState.setTypedReference(setRefState, "coordinatedNoun", coordNounId, "coordinator", undefined);
            setRefState = AtomicChange.apply(setRefState, ...changes);
            assert.isUndefined(setRefState.elements[andCoordId].ref);
            assert.isUndefined((setRefState.elements[coordNounId].value as ElementMapper<"coordinatedNoun">).coordinator);
            // add
            const newRef: ElementReference<"coordinator"> = { id: andCoordId, type: "coordinator" };
            changes = DiagramState.setTypedReference(setRefState, "coordinatedNoun", coordNounId, "coordinator", newRef);
            setRefState = AtomicChange.apply(setRefState, ...changes);
            assert.strictEqual(setRefState.elements[andCoordId].ref, coordNounId);
            assert.deepStrictEqual((setRefState.elements[coordNounId].value as ElementMapper<"coordinatedNoun">).coordinator, newRef);
        });

        test("replace value", () => {
            const to1Id = "to1";
            const to2Id = "to2";
            const to1Word: Word = {
                id: to1Id,
                lexeme: "to"
            };
            const to2Word: Word = {
                id: to2Id,
                lexeme: "to"
            };
            const infId = "inf";
            const inf: Infinitive = {
                id: infId,
                posType: "infinitive",
                to: { id: to1Id, type: "word" }
            };
            let testState: DiagramState = {
                wordOrder: [to1Id, to2Id],
                elements: {
                    [to1Id]: {
                        type: "word",
                        value: to1Word,
                        ref: infId
                    },
                    [to2Id]: {
                        type: "word",
                        value: to2Word
                    },
                    [infId]: {
                        type: "infinitive",
                        value: inf
                    }
                }
            };
            const changes = DiagramState.setTypedReference(testState, "infinitive", infId, "to", { id: to2Id, type: "word" });
            testState = AtomicChange.apply(testState, ...changes);
            assert.isUndefined(testState.elements[to1Id].ref);
            assert.strictEqual(testState.elements[to2Id].ref, infId);
            assert.deepStrictEqual((testState.elements[infId].value as Infinitive).to, { id: to2Id, type: "word" });
        });

        test("error - wrong type", () => {
            assert.throw(
                () => DiagramState.setReference(setRefState, "noun", coordNounId, "words", undefined),
                /does not have type/i
            );
        });

        test("error - both undefined", () => {
            delete (setRefState.elements[coordNounId].value as ElementMapper<"coordinatedNoun">).items;
            assert.throw(
                () => DiagramState.setReference(setRefState, "coordinatedNoun", coordNounId, "items", undefined),
                /cannot both be undefined/i
            );
        });

        test("error - expected array", () => {
            assert.throw(
                () => DiagramState.setReference(setRefState, "coordinatedNoun", coordNounId, "items", { id: dogsNounId, type: "noun" }),
                /expected array/i
            );
        });

        test("error - expected value", () => {
            assert.throw(
                () => DiagramState.setReference(setRefState, "coordinatedNoun", coordNounId, "coordinator", [{ id: dogsNounId, type: "noun" }]),
                /expected value/i
            );
        });
    });

    describe("getEmptyElements", () => {
        test("all empty", () => {
            const changes = [
                DiagramState.createAddItem("infinitive"),
                DiagramState.createAddItem("noun"),
                DiagramState.createAddItem("preposition"),
                DiagramState.createAddItem("pronoun")
            ];
            const expected = changes.map(([id]) => id).sort();
            state = AtomicChange.apply(state, ...changes.map(([, chg]) => chg));
            const result = DiagramState.getEmptyElements(state).sort();
            assert.deepStrictEqual(result, expected);
        });

        test("will be empty", () => {
            const [nounId, addNoun] = DiagramState.createAddItem("noun");
            const [nounPhraseId, addNounPhrase] = DiagramState.createAddItem("nounPhrase");
            const [indClauseId, addIndClause] = DiagramState.createAddItem("independentClause");
            state = AtomicChange.apply(
                state,
                addNoun,
                addNounPhrase,
                addIndClause
            );
            state = AtomicChange.apply(
                state,
                ...DiagramState.createTypedAddReference(
                    state,
                    "nounPhrase",
                    nounPhraseId,
                    "head",
                    nounId
                )
            );
            state = AtomicChange.apply(
                state,
                ...DiagramState.createTypedAddReference(
                    state,
                    "independentClause",
                    indClauseId,
                    "subject",
                    nounPhraseId
                )
            );
            const expected = [nounId, nounPhraseId, indClauseId].sort();
            const result = DiagramState.getEmptyElements(state).sort();
            assert.deepStrictEqual(result, expected);
        });
    });

    test("createDeleteEmptyElements", () => {
        const [nounId, addNoun] = DiagramState.createAddItem("noun");
        const [nounPhraseId, addNounPhrase] = DiagramState.createAddItem("nounPhrase");
        const [verbId, addVerb] = DiagramState.createAddItem("verb");
        state = AtomicChange.apply(state, addNoun, addNounPhrase, addVerb);
        state = AtomicChange.apply(
            state,
            ...DiagramState.createTypedAddReference(
                state,
                "nounPhrase",
                nounPhraseId,
                "head",
                nounId
            )
        );
        const keys = [nounId, nounPhraseId, verbId];
        assert.containsAllKeys(state.elements, keys);
        state = AtomicChange.apply(
            state,
            ...DiagramState.createDeleteEmptyElements(state)
        );
        keys.forEach((key) => assert.isUndefined(state.elements[key]));
    });
});