import { assert } from "chai";
import { DerivationTree } from "../derivation-tree";

describe("derivation-tree", () => {
    describe("getDerivationTree", () => {
        test("available", () => {
            const result = DerivationTree.getDerivationTree("noun");
            const expected: DerivationTree = {
                partOfSpeech: [{
                    baseType: "noun",
                    coordType: {
                        type: "coordinatedNoun",
                        properties: ["items"]
                    }
                }],
                phrase: [
                    {
                        baseType: "nounPhrase",
                        primaryType: {
                            type: "nounPhrase",
                            properties: ["head"]
                        },
                        coordType: {
                            type: "coordinatedNounPhrase",
                            properties: ["items"]
                        }
                    },
                    {
                        baseType: "prepositionPhrase",
                        primaryType: {
                            type: "prepositionPhrase",
                            properties: ["object"]
                        }
                    }
                ],
                clause: [
                    {
                        baseType: "independentClause",
                        primaryType: {
                            type: "independentClause",
                            properties: ["subject"]
                        }
                    },
                    {
                        baseType: "nounClause",
                        primaryType: {
                            type: "nounClause",
                            properties: ["subject"]
                        }
                    },
                    {
                        baseType: "relativeClause",
                        primaryType: {
                            type: "relativeClause",
                            properties: ["subject"]
                        }
                    },
                    {
                        baseType: "adverbialClause",
                        primaryType: {
                            type: "adverbialClause",
                            properties: ["subject"]
                        }
                    }
                ]
            };
            assert.deepStrictEqual(result, expected);
        });

        test("unavailable", () => {
            const result = DerivationTree.getDerivationTree("coordinatedAdjectivePhrase");
            assert.isUndefined(result);
        });
    });
});