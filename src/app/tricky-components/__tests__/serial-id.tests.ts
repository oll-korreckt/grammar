import { assert } from "chai";
import { SerialId } from "../serial-id";

describe("SerialId", () => {
    test("getNextId", () => {
        for (let value = 1; value < 500; value++) {
            const expected = SerialId.numberToId(value);
            const result = SerialId.getNextId();
            assert.strictEqual(result, expected);
        }
    });

    describe("numberToId", () => {
        test("standard", () => {
            function runTest(input: number, expected: string): void {
                const result = SerialId.numberToId(input);
                assert.equal(result, expected);
            }

            const testValues: [number, string][] = [
                [1, "a"],
                [2, "b"],
                [26, "z"],
                [27, "aa"],
                [343, "me"],
                [3010, "dkt"]
            ];
            testValues.forEach(([i, e]) => runTest(i, e));
        });

        test("error", () => {
            expect(() => SerialId.numberToId(0)).toThrow(/greater than 0/i);
            expect(() => SerialId.numberToId(4.3)).toThrow(/integer values/i);
        });
    });

    describe("idToNumber", () => {
        test("standard", () => {
            function runTest(input: SerialId, expected: number): void {
                const result = SerialId.idToNumber(input);
                assert.strictEqual(result, expected);
            }
            const tests: [SerialId, number][] = [
                ["a", 1],
                ["b", 2],
                ["z", 26],
                ["aa", 27],
                ["wz", 624],
                ["bgw", 1557]
            ];
            tests.forEach(([i, e]) => runTest(i, e));
        });

        test("error", () => {
            expect(() => SerialId.idToNumber("HI")).toThrow(/is not a serialid/i);
        });
    });

    test("isSerialId", () => {
        function runTest(input: string, expected: boolean): void {
            const result = SerialId.isSerialId(input);
            assert.strictEqual(result, expected);
        }

        const tests: [string, boolean][] = [
            ["sdfhlksdfljk2", false],
            ["a", true],
            ["", false],
            ["dsfj.dfjkl", false],
            ["dfslkjldshe", true],
            ["JKLDKSJE", false]
        ];
        tests.forEach(([i, e]) => runTest(i, e));
    });
});