import { assert } from "chai";
import { Token, TokenType } from "..";
import { scan, ScannerError } from "../scanner";

const hyphen = "-";
const enDash = "–";
const emDash = "—";
const whiteSpace: [string, TokenType] = [" ", "whitespace"];

describe("scan", () => {
    test("simple sentence", () => {
        runTest("Does this work", [
            ["Does", "word"],
            whiteSpace,
            ["this", "word"],
            whiteSpace,
            ["work", "word"]
        ]);
    });

    test("trailing spaces", () => {
        runTest("Trailing    spaces     ", [
            ["Trailing", "word"],
            ["    ", "whitespace"],
            ["spaces", "word"],
            ["     ", "whitespace"]
        ]);
    });

    test("punctuation", () => {
        runTest("The TV costs $529.99.", [
            ["The", "word"],
            whiteSpace,
            ["TV", "word"],
            whiteSpace,
            ["costs", "word"],
            whiteSpace,
            ["$529.99.", "word"]
        ]);

        runTest("He was #1!", [
            ["He", "word"],
            whiteSpace,
            ["was", "word"],
            whiteSpace,
            ["#1!", "word"]
        ]);

        runTest("They [the students] failed the test.", [
            ["They", "word"],
            whiteSpace,
            ["[the", "word"],
            whiteSpace,
            ["students]", "word"],
            whiteSpace,
            ["failed", "word"],
            whiteSpace,
            ["the", "word"],
            whiteSpace,
            ["test.", "word"]
        ]);

        runTest("Bob's", [["Bob's", "word"]]);
    });

    describe("hyphens + dashes", () => {
        test("hypen compound word", () => {
            runTest(`this${hyphen}is${hyphen}just${hyphen}one${hyphen}word`, [
                [`this${hyphen}is${hyphen}just${hyphen}one${hyphen}word`, "word"]
            ]);
        });

        test("double hyphen", () => {
            runTest(`old${hyphen}${hyphen}fashioned`, [
                ["old", "word"],
                [`${hyphen}${hyphen}`, "whitespace"],
                ["fashioned", "word"]
            ]);
        });

        test("spaced hyphen", () => {
            runTest(`old ${hyphen} fashioned`, [
                ["old", "word"],
                [` ${hyphen} `, "whitespace"],
                ["fashioned", "word"]
            ]);
        });

        test("en dash compund word", () => {
            runTest(`this${enDash}is${enDash}just${enDash}one${enDash}word`, [
                [`this${enDash}is${enDash}just${enDash}one${enDash}word`, "word"]
            ]);
        });

        test("double en dash", () => {
            runTest(`old${enDash}${enDash}fashioned`, [
                ["old", "word"],
                [`${enDash}${enDash}`, "whitespace"],
                ["fashioned", "word"]
            ]);
        });

        test("spaced en dash", () => {
            runTest(`old ${enDash} fashioned`, [
                ["old", "word"],
                [` ${enDash} `, "whitespace"],
                ["fashioned", "word"]
            ]);
        });

        test("em dash", () => {
            runTest(`old${emDash}fashioned`, [
                ["old", "word"],
                [emDash, "whitespace"],
                ["fashioned", "word"]
            ]);
        });

        test("spaced em dash", () => {
            runTest(`old ${emDash} fashioned`, [
                ["old", "word"],
                [` ${emDash} `, "whitespace"],
                ["fashioned", "word"]
            ]);
        });
    });

    describe("errors", () => {
        test("Invalid char in isolation", () => {
            const result = scan("The cat !");
            assert.isObject(result);
            assert.strictEqual((result as ScannerError).position, 8);
        });

        test("Invalid char after dashes", () => {
            const result = scan("Some----:dashes");
            assert.isObject(result);
            assert.strictEqual((result as ScannerError).position, 8);
        });
    });

    function runTest(target: string, expected: [string, TokenType][]) {
        const expectedTokens: Token[] = [
            ...expected.map(([lexeme, tokenType]) => {
                return {
                    lexeme: lexeme,
                    tokenType: tokenType
                };
            }),
            { lexeme: "", tokenType: "end" }
        ];
        const result = scan(target);
        assert.deepEqual(result, expectedTokens);
    }
});
