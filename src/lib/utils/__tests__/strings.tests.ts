import { assert } from "chai";
import { Strings } from "../strings";

describe("Strings", () => {
    describe("printArray", () => {
        test("1 input", () => {
            const result = Strings.printArray(["hello"], " ");
            assert.strictEqual(result, "hello");
        });

        test("multi input", () => {
            const result = Strings.printArray(["hello", "hi", "goodbye", "later"], ", ");
            assert.strictEqual(
                result,
                "hello, hi, goodbye, later"
            );
        });

        test("error", () => {
            assert.throw(
                () => Strings.printArray([], ""),
                /empty array/i
            );
        });
    });
});