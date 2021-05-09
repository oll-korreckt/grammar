import { assert } from "chai";
import { isBlankWordTag, isNounTag, isVerbTag, isWordTag } from "..";

function runTypeGuardTest<T>(typeGuard: (x: any) => x is T, input: any, expected: boolean) {
    const result = typeGuard(input);
    assert.equal(result, expected);
}

describe("isWordTag", () => {
    test("good inputs", () => {
        const runTest = (x: any) => runTypeGuardTest(isWordTag, x, true);
        runTest({ lexeme: "" });
        runTest({ lexeme: "hi", posType: "noun" });
    });

    test("bad inputs", () => {
        const runTest = (x: any) => runTypeGuardTest(isWordTag, x, false);
        runTest("hi");
        runTest({ lexeme: undefined });
        runTest({ lexeme: "some value", posType: "not a valid posType" });
    });
});

describe("isBlankWordTag", () => {
    test("good inputs", () => {
        const runTest = (x: any) => runTypeGuardTest(isBlankWordTag, x, true);
        runTest({ lexeme: "yo" });
        runTest({ lexeme: "sup", posType: undefined });
    });

    test("bad inputs", () => {
        const runTest = (x: any) => runTypeGuardTest(isBlankWordTag, x, false);
        runTest({ lexeme: "hi", posType: "noun" });
        runTest(3);
    });
});

describe("isNounTag", () => {
    test("good inputs", () => {
        const runTest = (x: any) => runTypeGuardTest(isNounTag, x, true);
        runTest({ lexeme: "hello", posType: "noun" });
    });

    test("bad inputs", () => {
        const runTest = (x: any) => runTypeGuardTest(isNounTag, x, false);
        runTest({ lexeme: "hello" });
        runTest("hello");
    });
});

describe("isVerbTag", () => {
    test("good inputs", () => {
        const runTest = (x: any) => runTypeGuardTest(isVerbTag, x, true);
        runTest({ lexeme: "verb", posType: "verb" });
    });

    test("bad inputs", () => {
        const runTest = (x: any) => runTypeGuardTest(isVerbTag, x, false);
        runTest({ lexme: "not a verb", posType: "noun" });
    });
});