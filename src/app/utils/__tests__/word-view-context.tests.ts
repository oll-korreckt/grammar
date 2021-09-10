import { createState, Ids } from "@app/testing";
import { assert } from "chai";
import { DiagramState, SelectedNodeChain } from "..";

describe("word-view-context", () => {
    describe("generateChain", () => {
        let state: DiagramState;
        beforeEach(() => {
            state = createState();
        });

        test("5-layer deep", () => {
            const result = SelectedNodeChain.generateChain(state, Ids.brown, "select");
            const expected: SelectedNodeChain = [
                { id: Ids.indClause, type: "independentClause", state: "expand" },
                { id: Ids.foxNounPhrase, type: "nounPhrase", state: "expand", property: "subject" },
                { id: Ids.quickBrownAdjPhrase, type: "adjectivePhrase", state: "expand", property: "modifiers" },
                { id: Ids.quickBrownAdj, type: "adjective", state: "expand", property: "head" },
                { id: Ids.brown, type: "word", state: "select", property: "words" }
            ];
            assert.deepStrictEqual(result, expected);
        });

        test("top layer", () => {
            const result = SelectedNodeChain.generateChain(state, Ids.indClause, "expand");
            const expected: SelectedNodeChain = [
                { id: Ids.indClause, type: "independentClause", state: "expand" }
            ];
            assert.deepStrictEqual(result, expected);
        });
    });
});