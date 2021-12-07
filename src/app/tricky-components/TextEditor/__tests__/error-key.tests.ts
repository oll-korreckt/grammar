import { assert } from "chai";
import { ErrorKey, KeyParts } from "../../../tricky-components/TextEditor/error-key";

describe("ErrorKey", () => {
    test("init", () => {
        const result = ErrorKey.init([0, 1, 2], 3);
        assert.strictEqual(result, "0 1 2 | 3");
    });

    test("init - error", () => {
        assert.throws(
            () => ErrorKey.init([], 1),
            /empty path/i
        );
    });

    test("getKeyParts", () => {
        const result = ErrorKey.getKeyParts("5 2 3 | 20");
        const expected: KeyParts = {
            path: [5, 2, 3],
            index: 20
        };
        assert.deepStrictEqual(result, expected);
    });

    test("sort", () => {
        const input = [
            "0 0 0 | 1",
            "0 0 0 | 0",
            "0 | 3",
            "0 0 | 0",
            "1 | 0",
            "2 | 3"
        ];
        const result = [...input].sort(ErrorKey.sortMethod);
        const expected = [
            "0 | 3",
            "0 0 | 0",
            "0 0 0 | 0",
            "0 0 0 | 1",
            "1 | 0",
            "2 | 3"
        ];
        assert.deepStrictEqual(result, expected);
    });
});