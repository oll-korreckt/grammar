import { createState, Ids } from "@app/testing";
import { Lexeme } from "@app/tricky-components/LabelView";
import { DiagramState, DiagramStateFunctions, WordLexeme } from "@app/utils";
import { ElementId } from "@domain/language";
import { assert } from "chai";
import { Utils } from "../utils";

function createLexemes(diagram: DiagramState, ids: ElementId[]): Lexeme[] {
    if (ids.length !== 9) {
        throw "need 9 ids";
    }
    const lexemes = [
        "The",
        "quick",
        "brown",
        "fox",
        "jumps",
        "over",
        "the",
        "lazy",
        "dog"
    ];
    const output: Lexeme[] = [];
    for (let index = 0; index < lexemes.length; index++) {
        const id = ids[index];
        const lexeme = lexemes[index];
        if (index > 0) {
            output.push({
                type: "whitespace",
                lexeme: " "
            });
        }
        output.push({
            type: "element",
            lexeme: lexeme,
            id: id
        });
    }
    return output;
}

describe("Utils", () => {
    describe("getAncestors", () => {
        test("has ancestors", () => {
            const state = createState();
            const result = Utils.getAncestors(state, Ids.the1);
            const expected = [
                Ids.the1Det,
                Ids.quickBrownAdjPhrase,
                Ids.foxNounPhrase,
                Ids.indClause
            ];
            assert.deepStrictEqual(result, expected);
        });

        test("no ancestors", () => {
            const state = createState();
            const result = Utils.getAncestors(state, Ids.indClause);
            assert.deepStrictEqual(result, []);
        });
    });

    describe("getChildren", () => {
        test("array", () => {
            const state = createState();
            const result = Utils.getChildren(state, Ids.quickBrownAdj);
            assert.sameMembers(
                result,
                [Ids.quick, Ids.brown]
            );
        });

        test("multi prop", () => {
            const state = createState();
            const result = Utils.getChildren(state, Ids.jumpsVerbPhrase);
            assert.sameMembers(
                result,
                [Ids.jumpsVerb, Ids.overPrepPhrase]
            );
        });
    });

    describe("getExpandedElements", () => {
        test("word", () => {
            const state = createState();
            const result = Utils.getExpandedElements(state, Ids.quickBrownAdj);
            const expected: ElementId[] = [
                Ids.the1Det,
                Ids.quick,
                Ids.brown,
                Ids.foxNoun,
                Ids.jumpsVerbPhrase
            ];
            assert.sameMembers(result, expected);
        });
    });

    describe("getLabelData", () => {
        test("expanded", () => {
            const state = createState();
            const result = Utils.getLabelData(state, { expanded: Ids.quickBrownAdj });
            const ids: ElementId[] = [
                Ids.the1Det,
                Ids.quick,
                Ids.brown,
                Ids.foxNoun,
                Ids.jumpsVerbPhrase,
                Ids.jumpsVerbPhrase,
                Ids.jumpsVerbPhrase,
                Ids.jumpsVerbPhrase,
                Ids.jumpsVerbPhrase
            ];
            const expected = createLexemes(state, ids);
            assert.deepStrictEqual(result, expected);
        });

        test("category", () => {
            let state = createState();
            state = DiagramStateFunctions.deleteItem(state, Ids.jumpsVerbPhrase);
            const result = Utils.getLabelData(state, { category: "phrase" });
            const ids: ElementId[] = [
                Ids.foxNounPhrase,
                Ids.foxNounPhrase,
                Ids.foxNounPhrase,
                Ids.foxNounPhrase,
                Ids.jumpsVerb,
                Ids.overPrepPhrase,
                Ids.overPrepPhrase,
                Ids.overPrepPhrase,
                Ids.overPrepPhrase
            ];
            const expected = createLexemes(state, ids);
            assert.deepStrictEqual(result, expected);
        });

        test("expanded + category", () => {
            let state = createState();
            state = DiagramStateFunctions.deleteItem(state, Ids.jumpsVerbPhrase);
            const result = Utils.getLabelData(state, { category: "clause", expanded: Ids.dogNounPhrase });
            const ids: ElementId[] = [
                Ids.indClause,
                Ids.indClause,
                Ids.indClause,
                Ids.indClause,
                Ids.jumpsVerb,
                Ids.overPrep,
                Ids.lazyAdjPhrase,
                Ids.lazyAdjPhrase,
                Ids.dogNoun
            ];
            const expected = createLexemes(state, ids);
            assert.deepStrictEqual(result, expected);
        });

        test("expanded + category 2", () => {
            const state = createState();
            const result = Utils.getLabelData(state, { category: "partOfSpeech", expanded: Ids.jumpsVerb });
            const ids: ElementId[] = [
                Ids.the1Det,
                Ids.quickBrownAdj,
                Ids.quickBrownAdj,
                Ids.foxNoun,
                Ids.jumps,
                Ids.overPrep,
                Ids.the2Det,
                Ids.lazyAdj,
                Ids.dogNoun
            ];
            const expected = createLexemes(state, ids);
            assert.deepStrictEqual(result, expected);
        });

        test("split infinitive", () => {
            let state = DiagramState.fromText("to boldly go");
            const toId = (state.lexemes[0] as WordLexeme).id;
            const boldlyId = (state.lexemes[2] as WordLexeme).id;
            const goId = (state.lexemes[4] as WordLexeme).id;
            const addInf = DiagramStateFunctions.addItem(state, "infinitive");
            const infId = addInf[0];
            state = addInf[1];
            const adv = DiagramStateFunctions.addItem(state, "adverb");
            const advId = adv[0];
            state = adv[1];
            state = DiagramStateFunctions.addReference(state, infId, "to", toId);
            state = DiagramStateFunctions.addReference(state, advId, "word", boldlyId);
            state = DiagramStateFunctions.addReference(state, infId, "verb", goId);
            const result = Utils.getLabelData(state, {});
            const expected: Lexeme[] = [
                {
                    type: "element",
                    id: infId,
                    lexeme: "to"
                },
                {
                    type: "whitespace",
                    lexeme: " "
                },
                {
                    type: "element",
                    id: advId,
                    lexeme: "boldly"
                },
                {
                    type: "whitespace",
                    lexeme: " "
                },
                {
                    type: "element",
                    id: infId,
                    lexeme: "go"
                }
            ];
            assert.deepStrictEqual(result, expected);
        });
    });
});