import { AtomicChange } from "@lib/utils";
import { assert } from "chai";
import { HistoryState } from "../history-state";

type TestType = {
    age: number;
    name: [string, string];
    address?: {
        street: string;
        city: string;
        state: string;
    };
}

describe("HistoryState", () => {
    let state: HistoryState<TestType>;
    beforeEach(() => {
        const baseState: TestType = {
            age: 25,
            name: ["john", "smith"],
            address: {
                street: "555 smith street",
                city: "smithsburg",
                state: "js"
            }
        };
        state = HistoryState.init(baseState);
    });

    test("init", () => {
        assert.deepStrictEqual(state.currState, state.baseState);
        assert.notEqual(state.currState, state.baseState);
        assert.isFalse(HistoryState.canUndo(state));
        assert.isFalse(HistoryState.canRedo(state));
    });

    test("stageChange", () => {
        state = HistoryState.stageChange(state, AtomicChange.createSet(
            ["age"],
            25,
            26
        ));
        assert.isTrue(HistoryState.canUndo(state));
        assert.isFalse(HistoryState.canRedo(state));
        assert.deepStrictEqual(
            state.currState,
            {
                age: 26,
                name: ["john", "smith"],
                address: {
                    street: "555 smith street",
                    city: "smithsburg",
                    state: "js"
                }
            }
        );
    });

    test("undo + redo changes", () => {
        // make 1st change
        state = HistoryState.stageChange(
            state,
            AtomicChange.createSet(
                ["age"],
                25,
                26
            ),
            AtomicChange.createSet(
                ["name"],
                ["john", "smith"],
                ["bob", "smith"]
            )
        );
        const midState: TestType = {
            age: 26,
            name: ["bob", "smith"],
            address: {
                street: "555 smith street",
                city: "smithsburg",
                state: "js"
            }
        };
        assert.deepStrictEqual(state.currState, midState);
        // make 2nd change
        state = HistoryState.stageChange(
            state,
            AtomicChange.createDelete(
                ["address"],
                state.currState.address
            )
        );
        const finalState: TestType = {
            age: 26,
            name: ["bob", "smith"]
        };
        assert.deepStrictEqual(state.currState, finalState);
        // undo 2nd change
        state = HistoryState.undoChange(state);
        assert.deepStrictEqual(state.currState, midState);
        assert.isTrue(HistoryState.canUndo(state));
        assert.isTrue(HistoryState.canRedo(state));
        // undo 1st change
        state = HistoryState.undoChange(state);
        assert.deepStrictEqual(state.currState, state.baseState);
        assert.isFalse(HistoryState.canUndo(state));
        assert.isTrue(HistoryState.canRedo(state));
        // redo both changes
        state = HistoryState.redoChange(HistoryState.redoChange(state));
        assert.deepStrictEqual(state.currState, finalState);
        assert.isTrue(HistoryState.canUndo(state));
        assert.isFalse(HistoryState.canRedo(state));
    });

    test("createChild", () => {
        state = HistoryState.stageChange(state, AtomicChange.createSet(
            ["age"],
            25,
            26
        ));
        const child = HistoryState.createChild(state);
        assert.notEqual(child.currState, state.currState);
        assert.deepStrictEqual(child.currState, state.currState);
        assert.notDeepEqual(child.baseState, state.baseState);
    });

    test("importChild", () => {
        let child = HistoryState.createChild(state);
        child = HistoryState.stageChange(
            child,
            AtomicChange.createSet(
                ["age"],
                25,
                26
            ),
            AtomicChange.createSet(
                ["address", "city"],
                "smithsburg",
                "smithsville"
            )
        );
        state = HistoryState.importChild(state, child);
        const expected: TestType = {
            age: 26,
            name: ["john", "smith"],
            address: {
                street: "555 smith street",
                city: "smithsville",
                state: "js"
            }
        };
        assert.deepStrictEqual(state.currState, expected);
    });
});