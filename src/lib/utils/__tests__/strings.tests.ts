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

    describe("isEnglishLetterChar", () => {
        test("lowercase", () => {
            assert.isTrue(Strings.isEnglishLetterChar("a"));
            assert.isTrue(Strings.isEnglishLetterChar("z"));
            assert.isTrue(Strings.isEnglishLetterChar("b"));
        });

        test("uppercase", () => {
            assert.isTrue(Strings.isEnglishLetterChar("A"));
            assert.isTrue(Strings.isEnglishLetterChar("Z"));
            assert.isTrue(Strings.isEnglishLetterChar("S"));
        });

        test("false", () => {
            assert.isFalse(Strings.isEnglishLetterChar("ä"));
            assert.isFalse(Strings.isEnglishLetterChar("Ä"));
            assert.isFalse(Strings.isEnglishLetterChar("ö"));
            assert.isFalse(Strings.isEnglishLetterChar("Ö"));
            assert.isFalse(Strings.isEnglishLetterChar("ü"));
            assert.isFalse(Strings.isEnglishLetterChar("Ü"));
            assert.isFalse(Strings.isEnglishLetterChar("@"));
            assert.isFalse(Strings.isEnglishLetterChar("ñ"));
        });

        test("error", () => {
            assert.throws(() => Strings.isEnglishLetterChar(""));
            assert.throws(() => Strings.isEnglishLetterChar("bc"));
        });
    });

    describe("isNumericChar", () => {
        test("true", () => {
            assert.isTrue(Strings.isNumericChar("0"));
            assert.isTrue(Strings.isNumericChar("9"));
            assert.isTrue(Strings.isNumericChar("4"));
        });

        test("false", () => {
            assert.isFalse(Strings.isNumericChar("o"));
            assert.isFalse(Strings.isNumericChar("I"));
            assert.isFalse(Strings.isNumericChar("l"));
            assert.isFalse(Strings.isNumericChar("O"));
        });

        test("error", () => {
            assert.throws(() => Strings.isNumericChar(""));
            assert.throws(() => Strings.isNumericChar("00"));
        });
    });
});