import { assert } from "chai";
import { ElementModelAddress } from "../types";

describe("ElementModelAddress", () => {
    test("toString", () => {
        const result = ElementModelAddress.toString({
            page: "preposition-phrase",
            name: "Hello"
        });
        const expected = "preposition-phrase.Hello";
        assert.strictEqual(result, expected);
    });

    describe("fromString", () => {
        test("success", () => {
            const result = ElementModelAddress.fromString("noun.hello");
            const expected: ElementModelAddress = { page: "noun", name: "hello" };
            assert.deepStrictEqual(result, expected);
        });

        test("error: too many dots", () => {
            assert.throws(() => ElementModelAddress.fromString("noun.hello.hello"));
        });

        test("error: fails validity", () => {
            assert.throws(() => ElementModelAddress.fromString("noun.!"));
        });
    });
});