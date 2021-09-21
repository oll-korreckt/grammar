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

    describe("capitalize", () => {
        test("starts w/ lowercase letter", () => {
            const result = Strings.capitalize("what");
            assert.strictEqual(result, "What");
        });

        test("starts w/ uppercase letter", () => {
            const result = Strings.capitalize("What");
            assert.strictEqual(result, "What");
        });

        test("starts w/ non-letter", () => {
            const result = Strings.capitalize("   ");
            assert.strictEqual(result, "   ");
        });

        test("error", () => {
            assert.throw(
                () => Strings.capitalize("")
            );
        });
    });
});