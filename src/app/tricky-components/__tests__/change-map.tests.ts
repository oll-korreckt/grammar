import { AtomicChange, ChangeKey, ChangeType } from "@lib/utils";
import { assert } from "chai";
import { ChangeMap } from "../change-map";

describe("ChangeMap", () => {
    describe("update", () => {
        test("from blank", () => {
            const result = ChangeMap.update(
                {},
                ["one", "two", "three"],
                ChangeType.Set
            );
            const expected: ChangeMap = {
                one: {
                    two: {
                        three: ChangeType.Set
                    }
                }
            };
            assert.deepEqual(result, expected);
        });

        test("depth of 1", () => {
            const result = ChangeMap.update(
                {},
                ["one"],
                ChangeType.Delete
            );
            const expected: ChangeMap = { one: ChangeType.Delete };
            assert.deepEqual(result, expected);
        });

        test("from existing - deeper", () => {
            const input: ChangeMap = {
                one: {
                    two: ChangeType.Set
                }
            };
            const result = ChangeMap.update(
                input,
                ["one", "two", "three"],
                ChangeType.Delete
            );
            assert.deepEqual(result, input);
        });

        test("from existing - shallower", () => {
            const input: ChangeMap = {
                one: {
                    two: ChangeType.Set
                }
            };
            const result = ChangeMap.update(
                input,
                ["one"],
                ChangeType.Delete
            );
            assert.deepEqual(result, { one: ChangeType.Delete });
        });

        test("from existing - same depth", () => {
            const input: ChangeMap = {
                one: {
                    two: ChangeType.Delete
                }
            };
            const result = ChangeMap.update(
                input,
                ["one", "two"],
                ChangeType.Set
            );
            const expected: ChangeMap = {
                one: {
                    two: ChangeType.Set
                }
            };
            assert.deepEqual(result, expected);
        });

        test("from existing - parallels", () => {
            const input: ChangeMap = {
                a: {
                    aa: {
                        aaa: ChangeType.Set
                    },
                    ab: ChangeType.Delete
                },
                b: {
                    ba: ChangeType.Delete,
                    bb: {
                        bba: ChangeType.Set
                    }
                }
            };
            const result = ChangeMap.update(
                input,
                ["a", "aa"],
                ChangeType.Delete
            );
            const expected: ChangeMap = {
                a: {
                    aa: ChangeType.Delete,
                    ab: ChangeType.Delete
                },
                b: {
                    ba: ChangeType.Delete,
                    bb: {
                        bba: ChangeType.Set
                    }
                }
            };
            assert.deepEqual(result, expected);
        });

        test("with array", () => {
            const result = ChangeMap.update(
                {},
                ["one", "two", 3],
                ChangeType.Remove
            );
            const expected: ChangeMap = {
                one: {
                    two: ChangeType.Set
                }
            };
            assert.deepEqual(result, expected);
        });

        test("error", () => {
            expect(() => ChangeMap.update({}, [1], ChangeType.Set)).toThrow(/first subkey/i);
            expect(() => ChangeMap.update({}, ["a"], ChangeType.Insert)).toThrow(/changetype/i);
        });
    });

    describe("extractChanges", () => {
        test("1 layer", () => {
            const map: ChangeMap = { one: ChangeType.Delete };
            const currVal = {
                one: {
                    two: {
                        three: "three"
                    }
                }
            };
            const result = ChangeMap.extractChanges(map, currVal, {});
            const expected = [
                AtomicChange.createDelete(
                    ["one"],
                    { two: { three: "three" } }
                )
            ];
            assert.deepEqual(result, expected);
        });

        test("3 layers", () => {
            const map: ChangeMap = {
                one: {
                    two: {
                        three: ChangeType.Set
                    }
                }
            };
            const currVal = {
                one: {
                    two: {
                        three: "three"
                    }
                }
            };
            const newVal = {
                one: {
                    two: {
                        three: 3
                    }
                }
            };
            const result = ChangeMap.extractChanges(map, currVal, newVal);
            const expected = [
                AtomicChange.createSet(
                    ["one", "two", "three"],
                    "three",
                    3
                )
            ];
            assert.deepEqual(result, expected);
        });

        test("multiple changes", () => {
            const map: ChangeMap = {
                one: ChangeType.Delete,
                two: ChangeType.Set,
                three: {
                    a: ChangeType.Set
                }
            };
            const currVal = {
                one: "one",
                two: "two",
                three: {
                    a: "a"
                }
            };
            const newVal = {
                two: 2,
                three: {
                    a: "0"
                }
            };
            const result = ChangeMap.extractChanges(map, currVal, newVal).sort((a, b) => ChangeKey.sort(a.key, b.key));
            const expected: AtomicChange[] = [
                AtomicChange.createDelete(["one"], currVal.one),
                AtomicChange.createSet(["two"], currVal.two, newVal.two),
                AtomicChange.createSet(["three", "a"], currVal.three.a, newVal.three.a)
            ].sort((a, b) => ChangeKey.sort(a.key, b.key));
            assert.deepEqual(result, expected);
        });
    });
});