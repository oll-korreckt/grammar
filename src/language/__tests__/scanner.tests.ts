import { assert } from "chai";
import { Token, TokenType } from "..";
import { scan } from "../scanner";

describe("scan", () => {
    test("simple sentence", () => {
        runTest("Does this work", [
            ["Does", "word"],
            [" ", "whitespace"],
            ["this", "word"],
            [" ", "whitespace"],
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

    test("throws error", () => {
        const action = () => scan("Contains invalid characters : ' ; !");
        expect(action).toThrow();
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
