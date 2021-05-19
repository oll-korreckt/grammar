import { LinkType } from "@app/utils";
import { ElementId, NounTag, WordTag } from "@domain/language";
import { AtomicChange } from "@lib/utils";
import { assert } from "chai";
import { Diagram } from "../diagram";

describe("SentenceState", () => {
    let state: Diagram;
    beforeEach(() => {
        state = Diagram.fromSentence("The quick brown fox jumped over the lazy dog");
    });

    test("undoChange + redoChange", () => {
        // check initial
        assert.isFalse(state.canUndo());
        assert.isFalse(state.canRedo());
        const id = "1.3";
        let current = state.getElement(id).value;
        const originalExpected: WordTag = { id: id, lexeme: "fox" };
        const currentExpected: WordTag = { id: id, lexeme: "fox", posType: "noun" };
        assert.deepEqual(current, { id: id, lexeme: "fox" });
        // stage a change
        state.stageChange(AtomicChange.createSet(
            [id, "value", "posType"],
            undefined,
            "noun"
        ));
        assert.isTrue(state.canUndo());
        assert.isFalse(state.canRedo());
        current = state.getElement(id).value;
        assert.deepEqual(current, currentExpected);
        // undo the change
        state.undoChange();
        current = state.getElement(id).value;
        assert.deepEqual(current, originalExpected);
        assert.isFalse(state.canUndo());
        assert.isTrue(state.canRedo());
        // redo the change
        state.redoChange();
        current = state.getElement(id).value;
        assert.deepEqual(current, currentExpected);
        assert.isTrue(state.canUndo());
        assert.isFalse(state.canRedo());
    });

    test("undoChange - error", () => {
        expect(() => state.undoChange()).toThrow("undo");
    });

    test("redoChange - error", () => {
        expect(() => state.redoChange()).toThrow("redo");
    });

    test("createAddLink", () => {
        const referenceId: ElementId = "1.3";
        const targetId: ElementId = "1.4";
        const expected: AtomicChange[] = [
            AtomicChange.createSet(
                [referenceId, "links", targetId],
                undefined,
                LinkType.Target
            ),
            AtomicChange.createSet(
                [targetId, "links", referenceId],
                undefined,
                LinkType.Reference
            )
        ];
        const result = state.createAddLink(referenceId, targetId);
        assert.deepEqual(result, expected);
    });

    test("createRemoveLink", () => {
        const referenceId: ElementId = "1.3";
        const targetId: ElementId = "1.4";
        const expected: AtomicChange[] = [
            AtomicChange.createSet(
                [referenceId, "links", targetId],
                undefined,
                LinkType.Target
            ),
            AtomicChange.createSet(
                [targetId, "links", referenceId],
                undefined,
                LinkType.Reference
            )
        ].map((x) => AtomicChange.invertChange(x));
        state.stageChange(...state.createAddLink(referenceId, targetId));
        const result = state.createRemoveLink(referenceId, targetId);
        assert.deepEqual(result, expected);
    });

    test("createValueOverwrite", () => {
        const newValue: NounTag = {
            ...state.getElement("1.3").value,
            posType: "noun"
        };
        const expected = AtomicChange.createSet(
            ["1.3", "value"],
            state.getElement("1.3").value,
            newValue
        );
        const result = state.createValueOverwrite(newValue);
        assert.deepEqual(expected, result);
    });

    test("multiple staged changes", () => {
        // stage 2 changes
        state.stageChange(AtomicChange.createSet(
            ["1.3", "value"],
            state.getElement("1.3").value,
            { id: "1.3", lexeme: "fox", posType: "noun" }
        ));
        state.stageChange(AtomicChange.createSet(
            ["1.4", "value"],
            state.getElement("1.4"),
            { id: "1.4", lexeme: "jumped", posType: "verb" }
        ));
        assert.deepEqual(
            state.getElement("1.3").value,
            { id: "1.3", lexeme: "fox", posType: "noun" }
        );
        assert.deepEqual(
            state.getElement("1.4").value,
            { id: "1.4", lexeme: "jumped", posType: "verb" }
        );
        // undo 1 change
        state.undoChange();
        assert.isTrue(state.canUndo());
        assert.isTrue(state.canRedo());
        // undo another change
        state.undoChange();
        assert.isFalse(state.canUndo());
        assert.isTrue(state.canRedo());
        // stage a change to overwrite remaining changes
        state.stageChange(AtomicChange.createSet(
            ["1.8", "value", "posType"],
            undefined,
            "noun"
        ));
        assert.isTrue(state.canUndo());
        assert.isFalse(state.canRedo());
    });

    test("createChild", () => {
        // create child
        state.stageChange(AtomicChange.createSet(
            ["1.3", "value", "lexeme"],
            "fox",
            "bear"
        ));
        const child = state.createChild();
        assert.isFalse(child.canUndo());
        assert.isFalse(child.canRedo());
        assert.deepEqual(
            child.getElement("1.3").value,
            { id: "1.3", lexeme: "bear" }
        );
        // stage changes
        child.stageChange(
            AtomicChange.createSet(
                ["1.4", "value", "posType"],
                undefined,
                "verb"
            ),
            AtomicChange.createSet(
                ["1.8", "value", "posType"],
                undefined,
                "noun"
            )
        );
        assert.notDeepEqual(
            child.getElement("1.4").value,
            state.getElement("1.4").value
        );
        assert.notDeepEqual(
            child.getElement("1.8").value,
            state.getElement("1.8").value
        );
    });

    test("importState", () => {
        // create child
        state.stageChange(
            AtomicChange.createSet(
                ["1.3", "value", "lexeme"],
                "fox",
                "bear"
            ),
            AtomicChange.createSet(
                ["1.3", "value", "posType"],
                undefined,
                "noun"
            )
        );
        const child = state.createChild();
        child.stageChange(
            AtomicChange.createSet(
                ["1.8", "value", "lexeme"],
                "dog",
                "hog"
            ),
            AtomicChange.createSet(
                ["1.8", "value", "posType"],
                undefined,
                "noun"
            )
        );
        state.importState(child);
        assert.deepEqual(
            state.getElement("1.8").value,
            state.getElement("1.8").value
        );
    });
});