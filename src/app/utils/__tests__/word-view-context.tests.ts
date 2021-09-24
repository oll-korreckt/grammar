import { createState, Ids } from "@app/testing";
import { ElementCategory, ElementId } from "@domain/language";
import { assert } from "chai";
import { DiagramState, DisplayModel, SelectedElementChain, _getVisibleElements, SelectedNodeChain } from "..";

describe("word-view-context", () => {
    let state: DiagramState;
    let model: DisplayModel;
    beforeAll(() => {
        state = createState();
        model = DisplayModel.init(state);
    });

    describe("_getVisibleElements", () => {
        function getResult(elementCategory: ElementCategory, selectedElement?: ElementId): ElementId[] {
            return _getVisibleElements(state, model, elementCategory, selectedElement)
                .map(({ id }) => id);
        }

        test("clause - no selection", () => {
            const result = getResult("clause");
            assert.deepStrictEqual(result, [Ids.indClause]);
        });

        test("clause - jumpsVerbPhrase", () => {
            const result = getResult("clause", Ids.jumpsVerbPhrase);
            assert.deepStrictEqual(
                result,
                [Ids.foxNounPhrase, Ids.jumpsVerb, Ids.overPrepPhrase]
            );
        });

        test("phrase - quickBrownAdjPhrase", () => {
            const result = getResult("phrase", Ids.quickBrownAdjPhrase);
            const expected = [
                Ids.the1Det,
                Ids.quickBrownAdj,
                Ids.foxNoun,
                Ids.jumpsVerbPhrase
            ];
            assert.deepStrictEqual(result, expected);
        });

        test("partOfSpeech - quickBrownAdj", () => {
            const result = getResult("partOfSpeech", Ids.quickBrownAdj);
            const expected = [
                Ids.the1Det,
                Ids.quick,
                Ids.brown,
                Ids.foxNoun,
                Ids.jumpsVerb,
                Ids.overPrep,
                Ids.the2Det,
                Ids.lazyAdj,
                Ids.dogNoun
            ];
            assert.deepStrictEqual(result, expected);
        });
    });

    describe("SelectedNodeChain.generateChain", () => {
        test("5-layer deep", () => {
            const result = SelectedNodeChain.generateChain(state, "clause", Ids.brown);
            const expected: SelectedElementChain = [
                { id: Ids.indClause, type: "independentClause" },
                { id: Ids.foxNounPhrase, type: "nounPhrase" },
                { id: Ids.quickBrownAdjPhrase, type: "adjectivePhrase" },
                { id: Ids.quickBrownAdj, type: "adjective" },
                { id: Ids.brown, type: "word" }
            ];
            assert.deepStrictEqual(result, expected);
        });

        test("top layer", () => {
            const result = SelectedNodeChain.generateChain(state, "clause", Ids.indClause);
            const expected: SelectedElementChain = [
                { id: Ids.indClause, type: "independentClause" }
            ];
            assert.deepStrictEqual(result, expected);
        });
    });
});