import { assert } from "chai";
import { SimpleObject, SimpleObjectValue, SimpleObjectValueType } from "..";

describe("SimpleObject", () => {
    describe("getValueType", () => {
        test("expected inputs", () => {
            function runTest(input: any, expected: SimpleObjectValueType) {
                const result = SimpleObject.getValueType(input);
                assert.equal(result, expected);
            }

            runTest(undefined, "undefined");
            runTest("what", "string");
            runTest(2, "number");
            runTest(true, "boolean");
            runTest({}, "object");
            runTest([], "array");
        });
        test("error", () => {
            const action = () => SimpleObject.getValueType(() => "error");
            assert.throws(action);
        });
    });

    describe("deepEquals", () => {
        describe("simple types", () => {
            test("diff types", () => {
                const result = SimpleObject.deepEquals("string", 42);
                assert.isFalse(result);
            });
            test("string", () => {
                const diff = SimpleObject.deepEquals("value1", "value2");
                assert.isFalse(diff);
                const same = SimpleObject.deepEquals("woof", "woof");
                assert.isTrue(same);
            });
            test("number", () => {
                const diff = SimpleObject.deepEquals(234, 3423);
                assert.isFalse(diff);
                const same = SimpleObject.deepEquals(1, 1);
                assert.isTrue(same);
            });
            test("boolean", () => {
                const diff = SimpleObject.deepEquals(true, false);
                assert.isFalse(diff);
                const same = SimpleObject.deepEquals(true, true);
                assert.isTrue(same);
            });
            test("undefined", () => {
                const result = SimpleObject.deepEquals(undefined, undefined);
                assert.isTrue(result);
            });
        });

        describe("object", () => {
            describe("typed", () => {
                test("diff prop values", () => {
                    const obj1 = {
                        name: "bob",
                        age: 22
                    };
                    const obj2 = {
                        name: "bob",
                        age: 23
                    };
                    const result = SimpleObject.deepEquals(obj1, obj2);
                    assert.isFalse(result);
                });

                test("diff shape", () => {
                    const obj1 = {
                        firstName: "bob",
                        lastName: "smith"
                    };
                    const obj2 = {
                        firstName: "bob",
                        lastName: "smith",
                        age: 22
                    };
                    const result = SimpleObject.deepEquals(obj1, obj2);
                    assert.isFalse(result);
                });

                test("diff nested shape", () => {
                    const obj1 = {
                        A: true,
                        B: {
                            b1: 1,
                            b2: 2,
                            b3: 3
                        }
                    };
                    const obj2 = {
                        A: true,
                        B: {
                            b1: 1,
                            b2: 2,
                            b3: 3,
                            b4: 4
                        }
                    };
                    const result = SimpleObject.deepEquals(obj1, obj2);
                    assert.isFalse(result);
                });

                test("diff nested prop values", () => {
                    const obj1 = {
                        A: true,
                        B: {
                            b1: true
                        }
                    };
                    const obj2 = {
                        A: true,
                        B: {
                            b1: false
                        }
                    };
                    const result = SimpleObject.deepEquals(obj1, obj2);
                    assert.isFalse(result);
                });

                test("equal", () => {
                    const obj1 = {
                        name: "value",
                        obj: {
                            name: "value"
                        }
                    };
                    const obj2 = {
                        name: "value",
                        obj: {
                            name: "value"
                        }
                    };
                    const result = SimpleObject.deepEquals(obj1, obj2);
                    assert.isTrue(result);
                });
            });

            describe("untyped", () => {
                test("diff prop names", () => {
                    const obj1 = { name: "bob" } as any;
                    const obj2 = { age: 22 } as any;
                    const result = SimpleObject.deepEquals(obj1, obj2);
                    assert.isFalse(result);
                });

                test("diff prop types", () => {
                    const obj1 = { name: "bob" } as any;
                    const obj2 = { name: 5 } as any;
                    const result = SimpleObject.deepEquals(obj1, obj2);
                    assert.isFalse(result);
                });

                test("not objects", () => {
                    const result = SimpleObject.deepEquals("string" as any, 2 as any);
                    assert.isFalse(result);
                });
            });
        });

        describe("array", () => {
            test("diff length", () => {
                const result = SimpleObject.deepEquals(
                    [1, 2, 3, 4],
                    [1, 2, 3, 4, 5]
                );
                assert.isFalse(result);
            });
            test("diff types - not equal", () => {
                const result = SimpleObject.deepEquals(
                    [1, "two", 3],
                    [1, 2, 3]
                );
                assert.isFalse(result);
            });
            test("diff types - equal", () => {
                const result = SimpleObject.deepEquals(
                    [undefined, "one", true, 3, [4], { five: 5 }],
                    [undefined, "one", true, 3, [4], { five: 5 }]
                );
                assert.isTrue(result);
            });
            test("empty", () => {
                const result = SimpleObject.deepEquals([], []);
                assert.isTrue(result);
            });
            test("nested", () => {
                const result = SimpleObject.deepEquals(
                    [
                        [1, 2, 3],
                        ["one", "two", "three"],
                        [[]]
                    ],
                    [
                        [1, 2, 3],
                        ["one", "two", "three"],
                        [[]]
                    ]
                );
                assert.isTrue(result);
            });
            test("with objs", () => {
                const result = SimpleObject.deepEquals(
                    [{
                        firstName: "bob",
                        lastName: "smith",
                        age: 25
                    }],
                    [{
                        firstName: "bob",
                        lastName: "smith",
                        age: 25
                    }]
                );
                assert.isTrue(result);
            });
        });
    });

    describe("clone", () => {
        test("simple types", () => {
            function runTest(input: SimpleObjectValue) {
                const result = SimpleObject.clone(input);
                assert.equal(result, input);
            }

            runTest(undefined);
            runTest("value");
            runTest(2);
            runTest(false);
        });

        describe("object", () => {
            test("simple", () => {
                const expected = {
                    age: 45,
                    firstName: "bob",
                    lastName: "smith"
                };
                const result = SimpleObject.clone(expected);
                assert.notEqual(result, expected);
                assert.deepEqual(result, expected);
            });
            test("nested", () => {
                const obj1 = {
                    age: 25,
                    employed: false,
                    name: {
                        firstName: "bob",
                        lastName: "smith"
                    }
                };
                const obj2 = SimpleObject.clone(obj1);
                assert.deepEqual(obj1, obj2);
                obj1.name.firstName = "jim";
                assert.notDeepEqual(obj1, obj2);
            });
        });

        test("array", () => {
            const expected = [undefined, "one", true, 3, [4], { five: 5 }];
            const result = SimpleObject.clone(expected);
            assert.notEqual(result, expected);
            assert.deepEqual(result, expected);
            result[0] = false;
            assert.notDeepEqual(result, expected);
        });
    });

    test("getSortedEntries", () => {
        const input = {
            a: "a",
            b: undefined,
            c: true,
            d: [],
            e: 3,
            f: {
                g: "g"
            }
        };
        const result = SimpleObject.getSortedEntries(input);
        const expected: typeof result = [
            ["a", "a"],
            ["c", true],
            ["d", []],
            ["e", 3],
            ["f", { g: "g" }]
        ];
        assert.deepEqual(result, expected);
    });

    describe("clean", () => {
        test("no props", () => {
            const input = {};
            const result = SimpleObject.clean(input);
            assert.deepStrictEqual(result, input);
            assert.notEqual(result, input);
        });

        test("nothing removed", () => {
            const input = {
                firstName: "bob",
                lastName: "smith"
            };
            const result = SimpleObject.clean(input);
            assert.deepStrictEqual(result, input);
            assert.notEqual(result, input);
        });

        test("props removed", () => {
            const input = {
                firstName: "bob",
                lastName: undefined,
                age: undefined
            };
            const expected = { firstName: "bob" };
            const result = SimpleObject.clean(input);
            assert.deepStrictEqual(result, expected);
            assert.doesNotHaveAnyKeys(result, ["lastName", "age"]);
            assert.notEqual(result, expected);
        });
    });
});
