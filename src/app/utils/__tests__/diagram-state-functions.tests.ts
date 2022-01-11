import { createState, Ids } from "@app/testing";
import { Adjective, ElementId, ElementRecord, ElementReference, Identifiable, Noun, Verb, VerbPhrase, Word } from "@domain/language";
import { SimpleObject } from "@lib/utils";
import { assert } from "chai";
import { DiagramState, TypedDiagramStateItem } from "..";
import { DiagramStateFunctions, Private } from "../diagram-state-functions";

function getNewItemId(oldState: DiagramState, newState: DiagramState): ElementId {
    const oldStateKeys = Object.keys(oldState.elements);
    const newStateKeys = Object.keys(newState.elements);
    const difference = oldStateKeys
        .filter((key) => !newStateKeys.includes(key))
        .concat(newStateKeys.filter((key) => !oldStateKeys.includes(key)));
    if (difference.length !== 1) {
        throw "only one difference is expected";
    }
    return difference[0];
}

function getReferences(element: Identifiable): ElementReference[] {
    const record = element as unknown as ElementRecord;
    const ids = new Set<ElementId>();
    const output: ElementReference[] = [];
    const values = Object.values(record);
    for (let index = 0; index < values.length; index++) {
        const value = values[index];
        if (value === undefined || typeof value === "string") {
            continue;
        }
        if (Array.isArray(value)) {
            value.forEach((ref) => {
                if (!ids.has(ref.id)) {
                    output.push(ref);
                    ids.add(ref.id);
                }
            });
        } else {
            if (!ids.has(value.id)) {
                output.push(value);
                ids.add(value.id);
            }
        }
    }
    return output;
}

describe("DiagramStateFunctions", () => {
    test("addItem", () => {
        const state = DiagramState.fromText("dog");
        const result = DiagramStateFunctions.addItem(state, "noun");
        assert.strictEqual(Object.keys(state.elements).length, 1);
        assert.strictEqual(Object.keys(result.elements).length, 2);
    });

    describe("deleteItem", () => {
        test("single element", () => {
            const state = DiagramState.fromText("dog");
            const [dogId] = Object.keys(state.elements);
            const withNoun = DiagramStateFunctions.addItem(state, "noun");
            const nounId = getNewItemId(state, withNoun);
            const result = DiagramStateFunctions.deleteItem(withNoun, nounId);
            assert.hasAllKeys(state.elements, [dogId]);
            assert.hasAllKeys(withNoun.elements, [dogId, nounId]);
            assert.hasAllKeys(result.elements, [dogId]);
        });

        test("multi element", () => {
            const state = createState();
            const { value, ref } = DiagramState.getItem(state, Ids.jumpsVerbPhrase);
            const childIds = getReferences(value).map(({ id }) => id);
            const result = DiagramStateFunctions.deleteItem(state, Ids.jumpsVerbPhrase);
            childIds.forEach((id) => {
                assert.strictEqual(DiagramState.getItem(state, id).ref, Ids.jumpsVerbPhrase);
                assert.isUndefined(DiagramState.getItem(result, id).ref);
            });
            assert.hasAnyKeys(state.elements, [Ids.jumpsVerbPhrase]);
            assert.doesNotHaveAnyKeys(result.elements, [Ids.jumpsVerbPhrase]);
            const oldParentValue = DiagramState.getItem(state, ref as ElementId).value;
            const oldParentRefs = getReferences(oldParentValue).map(({ id }) => id);
            assert.isTrue(oldParentRefs.includes(Ids.jumpsVerbPhrase));
            const newParentValue = DiagramState.getItem(result, ref as ElementId).value;
            const newParentRefs = getReferences(newParentValue).map(({ id }) => id);
            assert.isFalse(newParentRefs.includes(Ids.jumpsVerbPhrase));
        });
    });

    describe("deleteProperty", () => {
        test("object property", () => {
            const state = createState();
            const result = DiagramStateFunctions.deleteProperty(state, Ids.jumpsVerbPhrase, "head");
            assert.sameOrderedMembers(
                Object.keys(state.elements),
                Object.keys(result.elements)
            );
            const oldChild = DiagramState.getItem(state, Ids.jumpsVerb);
            const oldParent = DiagramState.getItem(state, Ids.jumpsVerbPhrase);
            const newChild = DiagramState.getItem(result, Ids.jumpsVerb);
            const newParent = DiagramState.getItem(result, Ids.jumpsVerbPhrase);
            assert.strictEqual(oldChild.ref, Ids.jumpsVerbPhrase);
            assert.hasAllKeys(oldParent.value, ["id", "phraseType", "head", "headModifier"]);
            assert.isUndefined(newChild.ref);
            assert.hasAllKeys(newParent.value, ["id", "phraseType", "headModifier"]);
        });

        test("array property", () => {
            const state = createState();
            const result = DiagramStateFunctions.deleteProperty(state, Ids.quickBrownAdj, "words");
            const oldChild1 = DiagramState.getItem(state, Ids.quick);
            const oldChild2 = DiagramState.getItem(state, Ids.brown);
            const oldParent = DiagramState.getItem(state, Ids.quickBrownAdj);
            const newChild1 = DiagramState.getItem(result, Ids.quick);
            const newChild2 = DiagramState.getItem(result, Ids.brown);
            const newParent = DiagramState.getItem(result, Ids.quickBrownAdj);
            assert.strictEqual(oldChild1.ref, Ids.quickBrownAdj);
            assert.strictEqual(oldChild2.ref, Ids.quickBrownAdj);
            assert.hasAllKeys(oldParent.value, ["id", "posType", "words"]);
            assert.isUndefined(newChild1.ref);
            assert.isUndefined(newChild2.ref);
            assert.hasAllKeys(newParent.value, ["id", "posType"]);
        });
    });

    describe("addReference", () => {
        test("object property", () => {
            const indClause: TypedDiagramStateItem<"independentClause"> = {
                type: "independentClause",
                value: {
                    id: "indClause",
                    clauseType: "independent",
                    predicate: { id: "verb", type: "verb" }
                }
            };
            const verb: TypedDiagramStateItem<"verb"> = {
                type: "verb",
                ref: "indClause",
                value: {
                    id: "verb",
                    posType: "verb"
                }
            };
            const verbPhrase: TypedDiagramStateItem<"verbPhrase"> = {
                type: "verbPhrase",
                value: {
                    id: "verbPhrase",
                    phraseType: "verb"
                }
            };
            const state: DiagramState = {
                lexemes: [],
                elements: { indClause, verb, verbPhrase }
            };
            const result = DiagramStateFunctions.addReference(state, "verbPhrase", "head", "verb");
            const newIndClause = DiagramState.getItem(result, "indClause");
            const newVerb = DiagramState.getItem(result, "verb");
            const newVerbPhrase = DiagramState.getItem(result, "verbPhrase");
            assert.hasAllKeys(newIndClause.value, ["id", "clauseType"]);
            assert.strictEqual(verb.ref, "indClause");
            assert.hasAllKeys(verbPhrase.value, ["id", "phraseType"]);
            assert.strictEqual(newVerb.ref, "verbPhrase");
            assert.hasAllKeys(newVerbPhrase.value, ["id", "phraseType", "head"]);
            assert.deepStrictEqual(
                (newVerbPhrase.value as VerbPhrase).head,
                { type: "verb", id: "verb" }
            );
        });

        test("array property", () => {
            const noun: TypedDiagramStateItem<"noun"> = {
                type: "noun",
                value: {
                    id: "noun",
                    posType: "noun",
                    words: [
                        { id: "quick", type: "word" },
                        { id: "brown", type: "word" }
                    ]
                }
            };
            const adj: TypedDiagramStateItem<"adjective"> = {
                type: "adjective",
                value: {
                    id: "adj",
                    posType: "adjective"
                }
            };
            const quick: TypedDiagramStateItem<"word"> = {
                type: "word",
                ref: "noun",
                value: {
                    id: "quick",
                    lexeme: "quick"
                }
            };
            const brown: TypedDiagramStateItem<"word"> = {
                type: "word",
                ref: "noun",
                value: {
                    id: "brown",
                    lexeme: "brown"
                }
            };
            const state: DiagramState = {
                lexemes: [],
                elements: { noun, adj, quick, brown }
            };
            const result1 = DiagramStateFunctions.addReference(state, "adj", "words", "quick");
            const expected1: DiagramState = {
                lexemes: [],
                elements: {
                    noun: {
                        type: "noun",
                        value: {
                            ...noun.value,
                            words: [{
                                id: "brown",
                                type: "word"
                            }]
                        } as Noun
                    },
                    adj: {
                        type: "adjective",
                        value: {
                            ...adj.value,
                            words: [{
                                id: "quick",
                                type: "word"
                            }]
                        } as Adjective
                    },
                    quick: {
                        ...quick,
                        ref: "adj"
                    },
                    brown: { ...brown }
                }
            };
            assert.deepStrictEqual(result1, expected1);
            const result2 = DiagramStateFunctions.addReference(result1, "adj", "words", "brown");
            const expected2: DiagramState = {
                lexemes: [],
                elements: {
                    noun: {
                        type: "noun",
                        value: {
                            id: "noun",
                            posType: "noun"
                        } as Noun
                    },
                    adj: {
                        type: "adjective",
                        value: {
                            ...adj.value,
                            words: [
                                { id: "quick", type: "word" },
                                { id: "brown", type: "word" }
                            ]
                        } as Adjective
                    },
                    quick: {
                        ...quick,
                        ref: "adj"
                    },
                    brown: {
                        ...brown,
                        ref: "adj"
                    }
                }
            };
            assert.deepStrictEqual(result2, expected2);
        });
    });

    describe("deleteReference", () => {
        test("object", () => {
            const verbPhrase: TypedDiagramStateItem<"verbPhrase"> = {
                type: "verbPhrase",
                value: {
                    id: "verbPhrase",
                    phraseType: "verb",
                    head: { id: "verb", type: "verb" }
                }
            };
            const verb: TypedDiagramStateItem<"verb"> = {
                type: "verb",
                ref: "verbPhrase",
                value: {
                    id: "verb",
                    posType: "verb"
                }
            };
            const state: DiagramState = {
                lexemes: [],
                elements: { verbPhrase, verb }
            };
            const stateClone = SimpleObject.clone(state);
            const result = DiagramStateFunctions.deleteReference(state, "verbPhrase", "head", "verb");
            const expected: DiagramState = {
                lexemes: [],
                elements: {
                    verbPhrase: {
                        type: "verbPhrase",
                        value: {
                            id: "verbPhrase",
                            phraseType: "verb"
                        } as VerbPhrase
                    },
                    verb: {
                        type: "verb",
                        value: { id: "verb", posType: "verb" } as Verb
                    }
                }
            };
            assert.deepStrictEqual(state, stateClone);
            assert.deepStrictEqual(result, expected);
        });

        test("array", () => {
            const adj: TypedDiagramStateItem<"adjective"> = {
                type: "adjective",
                value: {
                    id: "adj",
                    posType: "adjective",
                    words: [
                        { id: "quick", type: "word" },
                        { id: "brown", type: "word" }
                    ]
                }
            };
            const quick: TypedDiagramStateItem<"word"> = {
                type: "word",
                ref: "adj",
                value: {
                    id: "quick",
                    lexeme: "quick"
                }
            };
            const brown: TypedDiagramStateItem<"word"> = {
                type: "word",
                ref: "adj",
                value: {
                    id: "brown",
                    lexeme: "brown"
                }
            };
            const state: DiagramState = {
                lexemes: [],
                elements: { adj, quick, brown }
            };
            const stateClone = SimpleObject.clone(state);
            const result1 = DiagramStateFunctions.deleteReference(state, "adj", "words", "quick");
            assert.deepStrictEqual(state, stateClone);
            const expected1: DiagramState = {
                lexemes: [],
                elements: {
                    adj: {
                        type: "adjective",
                        value: {
                            id: "adj",
                            posType: "adjective",
                            words: [{
                                id: "brown",
                                type: "word"
                            }]
                        } as Adjective
                    },
                    quick: {
                        type: "word",
                        value: {
                            id: "quick",
                            lexeme: "quick"
                        } as Word
                    },
                    brown: {
                        type: "word",
                        ref: "adj",
                        value: {
                            id: "brown",
                            lexeme: "brown"
                        } as Word
                    }
                }
            };
            assert.deepStrictEqual(result1, expected1);
            const result2 = DiagramStateFunctions.deleteReference(result1, "adj", "words", "brown");
            const expected2: DiagramState = {
                lexemes: [],
                elements: {
                    adj: {
                        type: "adjective",
                        value: {
                            id: "adj",
                            posType: "adjective"
                        } as Adjective
                    },
                    quick: {
                        type: "word",
                        value: {
                            id: "quick",
                            lexeme: "quick"
                        } as Word
                    },
                    brown: {
                        type: "word",
                        value: {
                            id: "brown",
                            lexeme: "brown"
                        } as Word
                    }
                }
            };
            assert.deepStrictEqual(result2, expected2);
        });
    });
});

describe("Private", () => {
    test("_selectiveDeleteChildToParentReferences", () => {
        const who: TypedDiagramStateItem<"pronoun"> = {
            type: "pronoun",
            ref: "relClause",
            value: {
                id: "who",
                posType: "pronoun"
            }
        };
        const wants: TypedDiagramStateItem<"verb"> = {
            type: "verb",
            ref: "relClause",
            value: {
                id: "wants",
                posType: "verb"
            }
        };
        const relClause: TypedDiagramStateItem<"relativeClause"> = {
            type: "relativeClause",
            value: {
                id: "relClause",
                clauseType: "relative",
                dependentWord: {
                    id: "who",
                    type: "pronoun"
                },
                predicate: {
                    id: "wants",
                    type: "verb"
                }
            }
        };
        const elements: DiagramState["elements"] = { who, wants, relClause };
        Private._selectiveDeleteChildToParentReferences(elements, "relClause", "who");
        assert.strictEqual(who.ref, "relClause");
        assert.strictEqual(wants.ref, "relClause");
        assert.hasAllKeys(relClause.value, ["id", "clauseType", "dependentWord", "predicate"]);
    });
});