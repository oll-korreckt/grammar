import { assert } from "chai";
import { Diagram } from "../diagram";
import { Word } from "@domain/language";
import { AtomicChange, ChangeKey, ChangeType } from "@lib/utils";
import { TypedDiagramStateItem } from "@app/utils";

describe("SentenceState", () => {
    let state: Diagram;
    beforeEach(() => {
        state = Diagram.fromText("The quick brown fox jumped over the lazy dog.");
    });

    test("constructor", () => {
        // check initial
        assert.isFalse(state.canUndo());
        assert.isFalse(state.canRedo());
        const expected: Word = { id: "3", lexeme: "fox" };
        const result = state.getItem("3").value;
        assert.deepEqual(result, expected);
    });

    test("getItem - error", () => {
        assert.throw(
            () => state.getItem(""),
            /does not exist/i
        );
    });

    test("getTypedItem - error", () => {
        assert.throw(
            () => state.getTypedItem("adverbPhrase", "1"),
            /does not have type adverbphrase/i
        );
    });

    test("createAddItem", () => {
        const result = state.createAddItem("noun");
        assert.lengthOf(result.key, 1);
        if (result.type === ChangeType.Set) {
            assert.isUndefined(result.currVal);
            const newVal = result.newVal as TypedDiagramStateItem<"noun">;
            assert.deepEqual(
                newVal.value,
                {
                    id: result.key[0] as string,
                    posType: "noun"
                }
            );
        } else {
            assert.fail();
        }
    });

    describe("createDeleteItem", () => {
        test("standard", () => {
            const addNoun = state.createAddItem("noun");
            const nounId = addNoun.key[0] as string;
            state.stageChange(addNoun);
            const addNounPhrase = state.createAddItem("nounPhrase");
            const nounPhraseId = addNounPhrase.key[0] as string;
            state.stageChange(addNounPhrase);
            const addAdjectivePhrase = state.createAddItem("adjectivePhrase");
            const adjectivePhraseId = addAdjectivePhrase.key[0] as string;
            state.stageChange(addAdjectivePhrase);
            const addIndependentClause = state.createAddItem("independentClause");
            const independentClauseId = addIndependentClause.key[0] as string;
            state.stageChange(addIndependentClause);
            state.stageChange(...state.createAddReference("nounPhrase", nounPhraseId, "head", nounId));
            state.stageChange(...state.createAddReference("nounPhrase", nounPhraseId, "modifiers", adjectivePhraseId));
            state.stageChange(...state.createAddReference("independentClause", independentClauseId, "subject", nounPhraseId));
            const result = state.createDeleteItem(nounPhraseId).sort((a, b) => ChangeKey.sort(a.key, b.key));
            const expected: AtomicChange[] = [
                AtomicChange.createSet(
                    [nounId, "refs"],
                    state.getItem(nounId).refs,
                    []
                ),
                AtomicChange.createSet(
                    [adjectivePhraseId, "refs"],
                    state.getItem(adjectivePhraseId).refs,
                    []
                ),
                AtomicChange.createDelete(
                    [independentClauseId, "value", "subject"],
                    state.getTypedItem("independentClause", independentClauseId).value.subject
                ),
                AtomicChange.createDelete(
                    [nounPhraseId],
                    state.getItem(nounPhraseId)
                )
            ].sort((a, b) => ChangeKey.sort(a.key, b.key));
            assert.deepEqual(result, expected);
        });

        test("error - delete word", () => {
            assert.throw(
                () => state.createDeleteItem("3"),
                /cannot delete words/i
            );
        });

        test("error - referenced by word", () => {
            const addNoun = state.createAddItem("noun");
            const nounId = addNoun.key[0] as string;
            state.stageChange(addNoun);
            state.stageChange(AtomicChange.createSet(
                [nounId, "refs"],
                state.getItem(nounId).refs,
                ["3"]
            ));
            assert.throw(
                () => state.createDeleteItem(nounId),
                /'word' element type/i
            );
        });
    });

    describe("createAddReference", () => {
        test("standard", () => {
            const addNoun = state.createAddItem("noun");
            state.stageChange(addNoun);
            const nounId = addNoun.key[0] as string;
            const result = state.createAddReference("noun", nounId, "words", "3");
            const expected = [
                AtomicChange.createSet(
                    [nounId, "value", "words"],
                    undefined,
                    [{ id: "3", type: "word" }]
                ),
                AtomicChange.createSet(
                    ["3", "refs"],
                    [],
                    [nounId]
                )
            ];
            assert.deepEqual(result, expected);
        });

        test("error - reference not allowed", () => {
            const addVerbPhrase = state.createAddItem("verbPhrase");
            const verbPhraseId = addVerbPhrase.key[0] as string;
            state.stageChange(addVerbPhrase);
            assert.throw(
                () => state.createAddReference("verbPhrase", verbPhraseId, "head", "4"),
                /element is not allowed to reference a/i
            );
        });

        test("error - reference already exists - array property", () => {
            const addNoun = state.createAddItem("noun");
            state.stageChange(addNoun);
            const nounId = addNoun.key[0] as string;
            state.stageChange(...state.createAddReference("noun", nounId, "words", "3"));
            assert.throw(
                () => state.createAddReference("noun", nounId, "words", "3"),
                /already contains a reference to/i
            );
        });

        test("error - reference already exists - object property", () => {
            const addVerb = state.createAddItem("verb");
            state.stageChange(addVerb);
            const verbId = addVerb.key[0] as string;
            const addVerbPhrase = state.createAddItem("verbPhrase");
            state.stageChange(addVerbPhrase);
            const verbPhraseId = addVerbPhrase.key[0] as string;
            state.stageChange(...state.createAddReference("verbPhrase", verbPhraseId, "head", verbId));
            assert.throw(
                () => state.createAddReference("verbPhrase", verbPhraseId, "head", verbId),
                /already references/i
            );
        });
    });

    describe("createDeleteReference", () => {
        test("standard", () => {
            const addNoun = state.createAddItem("noun");
            const nounId = addNoun.key[0] as string;
            state.stageChange(addNoun);
            state.stageChange(...state.createAddReference("noun", nounId, "words", "3"));
            const result = state.createDeleteReference("noun", nounId, "words", "3");
            const expected = [
                AtomicChange.createDelete(
                    [nounId, "value", "words"],
                    state.getTypedItem("noun", nounId).value.words
                ),
                AtomicChange.createSet(
                    ["3", "refs"],
                    state.getItem("3").refs,
                    []
                )
            ];
            assert.deepEqual(result, expected);
        });

        test("error - no property", () => {
            const addNoun = state.createAddItem("noun");
            const nounId = addNoun.key[0] as string;
            state.stageChange(addNoun);
            assert.throw(
                () => state.createDeleteReference("noun", nounId, "words", ""),
                /does not have a 'words' property/i
            );
        });

        test("error - array - parent does not reference", () => {
            const addNoun = state.createAddItem("noun");
            const nounId = addNoun.key[0] as string;
            state.stageChange(addNoun);
            state.stageChange(...state.createAddReference("noun", nounId, "words", "3"));
            assert.throw(
                () => state.createDeleteReference("noun", nounId, "words", "8"),
                /element does not contain a reference/i
            );
        });

        test("error - array - parent has multiple references", () => {
            const addNoun = state.createAddItem("noun");
            const nounId = addNoun.key[0] as string;
            state.stageChange(addNoun);
            state.stageChange(...state.createAddReference("noun", nounId, "words", "3"));
            state.stageChange(AtomicChange.createSet(
                ["3", "refs"],
                state.getItem("3").refs,
                [...state.getItem("3").refs, nounId]
            ));
            const words = state.getTypedItem("noun", nounId).value.words;
            if (words === undefined) {
                throw "should not be undefined";
            }
            state.stageChange(AtomicChange.createSet(
                [nounId, "value", "words"],
                words,
                [...words, { id: "3", type: "word" }]
            ));
            assert.throw(
                () => state.createDeleteReference("noun", nounId, "words", "3"),
                /element contains multiple/i
            );
        });

        test("error - object - parent does not reference", () => {
            const addVerb = state.createAddItem("verb");
            const addVerbId = addVerb.key[0] as string;
            const addVerbPhrase = state.createAddItem("verbPhrase");
            const addVerbPhraseId = addVerbPhrase.key[0] as string;
            state.stageChange(addVerb, addVerbPhrase);
            state.stageChange(...state.createAddReference("verbPhrase", addVerbPhraseId, "head", addVerbId));
            state.stageChange(AtomicChange.createSet(
                [addVerbPhraseId, "value", "head"],
                state.getTypedItem("verbPhrase", addVerbPhraseId).value.head,
                {
                    id: "4",
                    type: "word"
                }
            ));
            assert.throw(
                () => state.createDeleteReference("verbPhrase", addVerbPhraseId, "head", addVerbId),
                /element does not reference/i
            );
        });

        test("error - child not referenced", () => {
            const addNoun = state.createAddItem("noun");
            const nounId = addNoun.key[0] as string;
            state.stageChange(addNoun);
            state.stageChange(...state.createAddReference("noun", nounId, "words", "3"));
            state.stageChange(AtomicChange.createSet(
                ["3", "refs"],
                state.getItem("3").refs,
                []
            ));
            assert.throw(
                () => state.createDeleteReference("noun", nounId, "words", "3"),
                /is not referenced by/i
            );
        });

        test("error - child referenced multiple times", () => {
            const addNoun = state.createAddItem("noun");
            const nounId = addNoun.key[0] as string;
            state.stageChange(addNoun);
            state.stageChange(...state.createAddReference("noun", nounId, "words", "3"));
            const refs = state.getItem("3").refs;
            state.stageChange(AtomicChange.createSet(
                ["3", "refs"],
                refs,
                [...refs, nounId]
            ));
            assert.throw(
                () => state.createDeleteReference("noun", nounId, "words", "3"),
                /is referenced.*multiple times/i
            );
        });
    });

    test("add item", () => {
        // create change
        const change = state.createAddItem("adverbPhrase");
        const id = change.key[0] as string;
        state.stageChange(change);
        assert.deepEqual(
            state.getTypedItem("adverbPhrase", id).value,
            {
                id: id,
                phraseType: "adverb"
            }
        );
        assert.isTrue(state.canUndo());
        assert.isFalse(state.canRedo());
        // undo
        state.undoChange();
        assert.isFalse(state.canUndo());
        assert.isTrue(state.canRedo());
        expect(() => state.getItem(id)).toThrow();
        // redo
        state.redoChange();
        assert.isTrue(state.canUndo());
        assert.isFalse(state.canRedo());
        assert.deepEqual(
            state.getTypedItem("adverbPhrase", id).value,
            {
                id: id,
                phraseType: "adverb"
            }
        );
    });

    test("undoChange - error", () => {
        expect(() => state.undoChange()).toThrow("undo");
    });

    test("redoChange - error", () => {
        expect(() => state.redoChange()).toThrow("redo");
    });

    test("child + import", () => {
        // make parent changes
        const change = state.createAddItem("noun");
        const id = change.key[0] as string;
        state.stageChange(change);
        state.stageChange(...state.createAddReference("noun", id, "words", "3"));
        assert.isTrue(state.canUndo());
        assert.isFalse(state.canRedo());
        assert.deepEqual(
            state.getTypedItem("noun", id).value,
            {
                id: id,
                posType: "noun",
                words: [{
                    id: "3",
                    type: "word"
                }]
            }
        );
        // create child
        const child = state.createChild();
        assert.isFalse(child.canUndo());
        assert.isFalse(child.canRedo());
        assert.deepEqual(
            child.getTypedItem("noun", id).value,
            {
                id: id,
                posType: "noun",
                words: [{
                    id: "3",
                    type: "word"
                }]
            }
        );
        // make child changes
        child.stageChange(...child.createDeleteItem(id));
        // check child changed
        assert.isTrue(child.canUndo());
        assert.isFalse(child.canRedo());
        assert.throw(() => child.getItem(id));
        // check parent not changed
        assert.isTrue(state.canUndo());
        assert.isFalse(state.canRedo());
        assert.deepEqual(
            state.getTypedItem("noun", id).value,
            {
                id: id,
                posType: "noun",
                words: [{
                    id: "3",
                    type: "word"
                }]
            }
        );
        // undo child change
        child.undoChange();
        assert.isFalse(child.canUndo());
        assert.isTrue(child.canRedo());
        assert.lengthOf(child.getItem("3").refs, 1);
        assert.deepEqual(
            child.getTypedItem("noun", id).value,
            {
                id: id,
                posType: "noun",
                words: [{
                    id: "3",
                    type: "word"
                }]
            }
        );
        // change child reference
        child.stageChange(...child.createDeleteReference("noun", id, "words", "3"));
        child.stageChange(...child.createAddReference("noun", id, "words", "8"));
        assert.deepEqual(
            child.getTypedItem("noun", id).value,
            {
                id: id,
                posType: "noun",
                words: [{
                    id: "8",
                    type: "word"
                }]
            }
        );
        // check parent not changed
        assert.isTrue(state.canUndo());
        assert.isFalse(state.canRedo());
        assert.deepEqual(
            state.getTypedItem("noun", id).value,
            {
                id: id,
                posType: "noun",
                words: [{
                    id: "3",
                    type: "word"
                }]
            }
        );
        // import child
        state.importState(child);
        // check parent state matches child
        assert.deepEqual(
            state.getItem(id),
            child.getItem(id)
        );
        assert.deepEqual(
            state.getItem("3"),
            child.getItem("3")
        );
        assert.deepEqual(
            state.getItem("8"),
            child.getItem("8")
        );
    });
});