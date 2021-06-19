import { ChangeType } from "@lib/utils";
import { assert } from "chai";
import { ChangeMap } from "../change-map";

describe("ChangeMap", () => {
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
    });
});